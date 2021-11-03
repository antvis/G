import { inject, injectable } from 'inversify';
import { Line, LINE_CAP, LINE_JOIN, Path, PolygonShape, Polyline } from '@antv/g';
import { fillMatrix4x4, fillVec4, makeSortKeyOpaque, RendererLayer } from '../render/utils';
import { CullMode, Format, VertexBufferFrequency } from '../platform';
import { RenderInst } from '../render/RenderInst';
import { DisplayObject, PARSED_COLOR_TYPE, Point, SHAPE, Tuple4Number } from '@antv/g';
import { DeviceProgram } from '../render/DeviceProgram';
import { Batch } from '.';

const segmentInstanceGeometry = [0, -0.5, 1, -0.5, 1, 0.5, 0, 0.5];

class InstancedLineProgram extends DeviceProgram {
  static a_Position = Object.keys(Batch.AttributeLocation).length;
  static a_PointA = Object.keys(Batch.AttributeLocation).length + 1;
  static a_PointB = Object.keys(Batch.AttributeLocation).length + 2;

  static ub_ObjectParams = 1;

  both: string = `
  ${Batch.ShaderLibrary.BothDeclaration}
  layout(std140) uniform ub_ObjectParams {
    vec4 u_Color;
  };
  `;

  vert: string = `
  ${Batch.ShaderLibrary.VertDeclaration}
  layout(location = ${InstancedLineProgram.a_Position}) attribute vec2 a_Position;
  layout(location = ${InstancedLineProgram.a_PointA}) attribute vec2 a_PointA;
  layout(location = ${InstancedLineProgram.a_PointB}) attribute vec2 a_PointB;

  void main() {
    ${Batch.ShaderLibrary.Vert}

    vec2 xBasis = a_PointB - a_PointA;
    vec2 yBasis = normalize(vec2(-xBasis.y, xBasis.x));
    vec2 point = a_PointA + xBasis * a_Position.x + yBasis * u_StrokeWidth * a_Position.y;

    point = point - a_Anchor * abs(xBasis);

    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * vec4(point, 0.0, 1.0);
  }
  `;

  frag: string = `
  ${Batch.ShaderLibrary.FragDeclaration}
  
  void main() {
    ${Batch.ShaderLibrary.Frag}

    gl_FragColor = u_StrokeColor;
    gl_FragColor.a = gl_FragColor.a * u_Opacity;
  }
`;
}

/**
 * use instanced for each segment
 * @see https://blog.scottlogic.com/2019/11/18/drawing-lines-with-webgl.html
 * TODO: dashed line
 * TODO: joint & cap
 */
@injectable()
export class InstancedLineRenderer extends Batch {
  protected program = new InstancedLineProgram();

  validate(object: DisplayObject) {
    return true;
  }

  buildGeometry() {
    const interleaved = [];
    const indices = [];
    this.objects.forEach((object, i) => {
      const line = object as Line;
      const offset = i * 4;
      const { x1, y1, x2, y2, defX, defY } = line.parsedStyle;
      interleaved.push(x1 - defX, y1 - defY, x2 - defX, y2 - defY);
      indices.push(0 + offset, 2 + offset, 1 + offset, 0 + offset, 3 + offset, 2 + offset);
    });

    this.geometry.setIndices(new Uint32Array(indices));
    this.geometry.vertexCount = 6;
    this.geometry.setVertexBuffer({
      bufferIndex: 1,
      byteStride: 4 * 2,
      frequency: VertexBufferFrequency.PerInstance,
      attributes: [
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 0,
          location: InstancedLineProgram.a_Position,
          divisor: 0,
        },
      ],
      data: new Float32Array(segmentInstanceGeometry),
    });
    this.geometry.setVertexBuffer({
      bufferIndex: 2,
      byteStride: 4 * 4,
      frequency: VertexBufferFrequency.PerInstance,
      attributes: [
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 0,
          location: InstancedLineProgram.a_PointA,
          divisor: 1,
        },
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 2,
          location: InstancedLineProgram.a_PointB,
          divisor: 1,
        },
      ],
      data: new Float32Array(interleaved),
    });
  }

  updateAttribute(object: DisplayObject, name: string, value: any): void {
    super.updateAttribute(object, name, value);
    const geometry = this.geometry;
    const index = this.objects.indexOf(object);

    const { x1, y1, x2, y2, defX, defY } = object.parsedStyle;

    if (name === 'x1' || name === 'y1' || name === 'x2' || name === 'y2') {
      geometry.updateVertexBuffer(
        2,
        InstancedLineProgram.a_PointA,
        index,
        new Uint8Array(new Float32Array([x1 - defX, y1 - defY, x2 - defX, y2 - defY]).buffer),
      );
    }
  }

  uploadUBO(renderInst: RenderInst): void {
    const instance = this.objects[0];

    const { stroke } = instance.parsedStyle;

    let strokeColor: Tuple4Number = [0, 0, 0, 0];
    if (stroke?.type === PARSED_COLOR_TYPE.Constant) {
      strokeColor = stroke.value;
    }

    // Upload to our UBO.
    let offs = renderInst.allocateUniformBuffer(InstancedLineProgram.ub_ObjectParams, 4);
    const d = renderInst.mapUniformBufferF32(InstancedLineProgram.ub_ObjectParams);
    offs += fillVec4(d, offs, ...strokeColor);
  }
}
