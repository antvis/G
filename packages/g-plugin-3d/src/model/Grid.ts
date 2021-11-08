import { DisplayObject, Renderable } from '@antv/g';
import { inject, singleton } from 'mana-syringe';
import { vec3 } from 'gl-matrix';
import {
  Batch,
  AttributeLocation,
  CullMode,
  DeviceProgram,
  Format,
  RenderInst,
  VertexBufferFrequency,
} from '@antv/g-plugin-webgl-renderer';
import { GridStyleProps } from '../Grid';

class GridProgram extends DeviceProgram {
  static a_Position = AttributeLocation.MAX;
  static a_GridSize = AttributeLocation.MAX + 1;

  static ub_ObjectParams = 1;

  both: string = `
  ${Batch.ShaderLibrary.BothDeclaration}
  `;

  vert: string = `
  ${Batch.ShaderLibrary.VertDeclaration}

  layout(location = ${GridProgram.a_Position}) attribute vec3 a_Position;
  layout(location = ${GridProgram.a_GridSize}) attribute vec2 a_GridSize;

  out vec3 v_Position;
  out vec2 v_GridSize;
  
  void main() {
    ${Batch.ShaderLibrary.Vert}

    v_GridSize = a_GridSize;

    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * vec4(a_Position, 1.0);
  }
  `;

  frag: string = `
  ${Batch.ShaderLibrary.FragDeclaration}

  // #extension GL_OES_standard_derivatives : enable

  in vec3 v_Position;
  in vec2 v_GridSize;
  
  void main() {
    ${Batch.ShaderLibrary.Frag}

    // vec4 u_GridColor = u_StrokeColor;
    vec4 u_GridColor = u_Color;
    float u_GridSize2 = v_GridSize.y;

    float wx = v_Position.x;
    float wz = v_Position.z;

    float x1 = abs(fract(wx / u_GridSize2 - 0.5) - 0.5) / fwidth(wx) * u_GridSize2;
    float z1 = abs(fract(wz / u_GridSize2 - 0.5) - 0.5) / fwidth(wz) * u_GridSize2;

    float v1 = 1.0 - clamp(min(x1, z1), 0.0, 1.0);
    gl_FragColor = mix(gl_FragColor, u_GridColor, v1);

    gl_FragColor.a = gl_FragColor.a * u_Opacity;
  }
  `;
}

@singleton()
export class GridModelBuilder extends Batch {
  program = new GridProgram();

  validate(object: DisplayObject) {
    return true;
  }

  updateAttribute(object: DisplayObject, name: string, value: any) {
    super.updateAttribute(object, name, value);
    const index = this.objects.indexOf(object);
    const geometry = this.geometry;
  }

  uploadUBO(renderInst: RenderInst): void {
    renderInst.setMegaStateFlags({
      cullMode: CullMode.None,
    });
  }

  buildGeometry() {
    const instance = this.objects[0];
    const { height, width } = instance.attributes;
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    this.geometry.setIndices(new Uint32Array([0, 3, 2, 2, 1, 0]));
    this.geometry.vertexCount = 6;
    this.geometry.setVertexBuffer({
      bufferIndex: 1,
      byteStride: 4 * 3,
      frequency: VertexBufferFrequency.PerVertex,
      attributes: [
        {
          format: Format.F32_RGB,
          bufferByteOffset: 4 * 0,
          location: GridProgram.a_Position,
        },
      ],
      data: Float32Array.from([
        -halfWidth,
        0,
        -halfHeight,
        halfWidth,
        0,
        -halfHeight,
        halfWidth,
        0,
        halfHeight,
        -halfWidth,
        0,
        halfHeight,
      ]),
    });
    this.geometry.setVertexBuffer({
      bufferIndex: 2,
      byteStride: 4 * 2,
      frequency: VertexBufferFrequency.PerInstance,
      attributes: [
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 0,
          location: GridProgram.a_GridSize,
          divisor: 1,
        },
      ],
      data: Float32Array.from([10, 10]),
    });
  }
}
