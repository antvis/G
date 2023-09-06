import type {
  Program,
  ProgramDescriptor,
} from '@antv/g-plugin-device-renderer';
import {
  assert,
  getAttributeLocations,
  getDefines,
  getUniformSetter,
  parseUniformName,
  ResourceType,
} from '@antv/g-plugin-device-renderer';
import { isNil } from '@antv/util';
import type { Device_GL } from './Device';
import { ResourceBase_GL } from './ResourceBase';
import { Texture_GL } from './Texture';
import { isWebGL2 } from './utils';

// const quadVert = `
// layout(location = 0) in vec2 a_Position;

// out vec2 v_TexCoord;

// void main() {
//   v_TexCoord = 0.5 * (a_Position + 1.0);
//   gl_Position = vec4(a_Position, 0., 1.);

//   #ifdef VIEWPORT_ORIGIN_TL
//     v_TexCoord.y = 1.0 - v_TexCoord.y;
//   #endif
// }
// `;

export enum ProgramCompileState_GL {
  NeedsCompile,
  Compiling,
  NeedsBind,
  ReadyToUse,
}

export class Program_GL extends ResourceBase_GL implements Program {
  type: ResourceType.Program = ResourceType.Program;

  gl_program: WebGLProgram;
  gl_shader_vert: WebGLShader | null;
  gl_shader_frag: WebGLShader | null;
  compileState: ProgramCompileState_GL;
  descriptor: ProgramDescriptor;

  uniformSetters: Record<string, any> = {};
  attributes: {
    name: string;
    location: number; // getAttribLocation()
    type: number;
    size: number;
  }[] = [];

  constructor({
    id,
    device,
    descriptor,
  }: {
    id: number;
    device: Device_GL;
    descriptor: ProgramDescriptor;
  }) {
    super({ id, device });

    const gl = this.device.gl;

    this.descriptor = descriptor;
    this.gl_program = this.device.ensureResourceExists(gl.createProgram());
    this.gl_shader_vert = null;
    this.gl_shader_frag = null;
    this.compileState = ProgramCompileState_GL.NeedsCompile;

    this.tryCompileProgram();
  }

  destroy() {
    super.destroy();
    this.device.gl.deleteProgram(this.gl_program);
    this.device.gl.deleteShader(this.gl_shader_vert);
    this.device.gl.deleteShader(this.gl_shader_frag);
  }

  private tryCompileProgram(): void {
    assert(this.compileState === ProgramCompileState_GL.NeedsCompile);

    const descriptor = this.descriptor;

    const gl = this.device.gl;
    if (this.gl_shader_vert !== null) gl.deleteShader(this.gl_shader_vert);
    if (this.gl_shader_frag !== null) gl.deleteShader(this.gl_shader_frag);

    // if (descriptor.compute) {
    //   this.gl_shader_vert = this.compileShader(
    //     preprocessShader_GLSL(this.device.queryVendorInfo(), 'vert', quadVert),
    //     gl.VERTEX_SHADER,
    //   );
    //   this.gl_shader_frag = this.compileShader(
    //     descriptor.preprocessedCompute,
    //     gl.FRAGMENT_SHADER,
    //   );
    // } else {
    this.gl_shader_vert = this.compileShader(
      descriptor.vertex.glsl,
      gl.VERTEX_SHADER,
    );
    this.gl_shader_frag = this.compileShader(
      descriptor.fragment.glsl,
      gl.FRAGMENT_SHADER,
    );
    // }

    gl.attachShader(this.gl_program, this.gl_shader_vert);
    gl.attachShader(this.gl_program, this.gl_shader_frag);
    gl.linkProgram(this.gl_program);

    this.compileState = ProgramCompileState_GL.Compiling;

    if (!isWebGL2(gl)) {
      // extract uniforms
      this.readUniformLocationsFromLinkedProgram();
      // extract attributes
      this.readAttributesFromLinkedProgram();
    }
  }

  private readAttributesFromLinkedProgram() {
    const gl = this.device.gl;
    const count = gl.getProgramParameter(this.gl_program, gl.ACTIVE_ATTRIBUTES);

    const defines = getDefines(this.descriptor.vertex.glsl);
    const locations = getAttributeLocations(
      this.descriptor.vertex.glsl,
      defines,
    );
    for (let index = 0; index < count; index++) {
      const { name, type, size } = gl.getActiveAttrib(this.gl_program, index);
      const location = gl.getAttribLocation(this.gl_program, name);

      const definedLocation = locations.find((l) => l.name === name)?.location;
      // Add only user provided attributes, for built-in attributes like
      // `gl_InstanceID` locaiton will be < 0
      if (location >= 0 && !isNil(definedLocation)) {
        this.attributes[definedLocation] = {
          name,
          location,
          type,
          size,
        };
      }
    }
  }

  private readUniformLocationsFromLinkedProgram() {
    const gl = this.device.gl;
    const numUniforms = gl.getProgramParameter(
      this.gl_program,
      gl.ACTIVE_UNIFORMS,
    );

    for (let i = 0; i < numUniforms; i++) {
      const info = gl.getActiveUniform(this.gl_program, i);
      const { name } = parseUniformName(info.name);
      let location = gl.getUniformLocation(this.gl_program, name);
      this.uniformSetters[name] = getUniformSetter(gl, location, info);
      if (info && info.size > 1) {
        for (let l = 0; l < info.size; l++) {
          location = gl.getUniformLocation(this.gl_program, `${name}[${l}]`);
          this.uniformSetters[`${name}[${l}]`] = getUniformSetter(
            gl,
            location,
            info,
          );
        }
      }
    }
  }

  private compileShader(contents: string, type: GLenum): WebGLShader {
    const gl = this.device.gl;
    const shader: WebGLShader = this.device.ensureResourceExists(
      gl.createShader(type),
    );
    gl.shaderSource(shader, contents);
    gl.compileShader(shader);
    return shader;
  }

  setUniforms(uniforms: Record<string, any> = {}) {
    const gl = this.device.gl;

    if (!isWebGL2(gl)) {
      let programUsed = false;
      for (const uniformName in uniforms) {
        if (!programUsed) {
          gl.useProgram(this.gl_program);
          programUsed = true;
        }

        const uniform = uniforms[uniformName];
        const uniformSetter = this.uniformSetters[uniformName];
        if (uniformSetter) {
          let value = uniform;
          if (value instanceof Texture_GL) {
            value = value.textureIndex;
          }
          uniformSetter(value);
        }
      }
    }

    return this;
  }
}
