import { ResourceType, Program, ProgramDescriptorSimple } from '../interfaces';
import { assert, getUniformSetter, parseUniformName } from '../utils';
import { Device_GL } from './Device';
import { ResourceBase_GL } from './ResourceBase';
import { isWebGL2 } from './utils';

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
  descriptor: ProgramDescriptorSimple;

  uniformSetters: Record<string, any> = {};
  attributes: {
    name: string;
    location: number;
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
    descriptor: ProgramDescriptorSimple;
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
    this.gl_shader_vert = this.compileShader(descriptor.preprocessedVert, gl.VERTEX_SHADER);
    this.gl_shader_frag = this.compileShader(descriptor.preprocessedFrag, gl.FRAGMENT_SHADER);
    gl.attachShader(this.gl_program, this.gl_shader_vert);
    gl.attachShader(this.gl_program, this.gl_shader_frag);
    gl.linkProgram(this.gl_program);

    this.compileState = ProgramCompileState_GL.Compiling;

    if (!isWebGL2(gl)) {
      // extract uniforms
      this.readUniformLocationsFromLinkedProgram();
      // extract attributes
      this.readAttributesFromProgram();
    }
  }

  private readAttributesFromProgram() {
    const gl = this.device.gl;
    const count = gl.getProgramParameter(this.gl_program, gl.ACTIVE_ATTRIBUTES);

    for (let index = 0; index < count; index++) {
      const { name, type, size } = gl.getActiveAttrib(this.gl_program, index);
      const location = gl.getAttribLocation(this.gl_program, name);
      // Add only user provided attributes, for built-in attributes like
      // `gl_InstanceID` locaiton will be < 0
      if (location >= 0) {
        this.attributes.push({
          name,
          location,
          type,
          size,
        });
      }
    }

    this.attributes.sort((a, b) => a.location - b.location);
  }

  private readUniformLocationsFromLinkedProgram() {
    const gl = this.device.gl;
    const numUniforms = gl.getProgramParameter(this.gl_program, gl.ACTIVE_UNIFORMS);

    for (let i = 0; i < numUniforms; i++) {
      const info = gl.getActiveUniform(this.gl_program, i);
      const { name } = parseUniformName(info.name);
      let location = gl.getUniformLocation(this.gl_program, name);
      this.uniformSetters[name] = getUniformSetter(gl, location, info);
      if (info && info.size > 1) {
        for (let l = 0; l < info.size; l++) {
          location = gl.getUniformLocation(this.gl_program, `${name}[${l}]`);
          this.uniformSetters[`${name}[${l}]`] = getUniformSetter(gl, location, info);
        }
      }
    }
  }

  private compileShader(contents: string, type: GLenum): WebGLShader {
    const gl = this.device.gl;
    const shader: WebGLShader = this.device.ensureResourceExists(gl.createShader(type));
    gl.shaderSource(shader, contents);
    gl.compileShader(shader);
    return shader;
  }

  setUniforms(uniforms: Record<string, any> = {}) {
    const gl = this.device.gl;
    gl.useProgram(this.gl_program);

    for (const uniformName in uniforms) {
      const uniform = uniforms[uniformName];
      const uniformSetter = this.uniformSetters[uniformName];

      if (uniformSetter) {
        let value = uniform;
        let textureUpdate = false;

        uniformSetter(value);

        // if (value instanceof Framebuffer) {
        //   value = value.texture;
        // }
        // if (value instanceof Texture) {
        //   textureUpdate = this.uniforms[uniformName] !== uniform;

        //   if (textureUpdate) {
        //     // eslint-disable-next-line max-depth
        //     if (uniformSetter.textureIndex === undefined) {
        //       uniformSetter.textureIndex = this._textureIndexCounter++;
        //     }

        //     // Bind texture to index
        //     const texture = value;
        //     const {textureIndex} = uniformSetter;

        //     texture.bind(textureIndex);
        //     value = textureIndex;

        //     this._textureUniforms[uniformName] = texture;
        //   } else {
        //     value = uniformSetter.textureIndex;
        //   }
        // } else if (this._textureUniforms[uniformName]) {
        //   delete this._textureUniforms[uniformName];
        // }

        // NOTE(Tarek): uniformSetter returns whether
        //   value had to be updated or not.
        // if (uniformSetter(value) || textureUpdate) {
        //   // copyUniform(this.uniforms, uniformName, uniform);
        // }
      }
    }

    return this;
  }
}
