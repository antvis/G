import { inject, injectable } from 'mana-syringe';
import {
  Line,
  LINE_CAP,
  LINE_JOIN,
  ParsedColorStyleProperty,
  Path,
  Pattern,
  PolygonShape,
  Polyline,
} from '@antv/g';
import { fillMatrix4x4, fillVec4, makeSortKeyOpaque, RendererLayer } from '../render/utils';
import { CullMode, Format, VertexBufferFrequency } from '../platform';
import { RenderInst } from '../render/RenderInst';
import { DisplayObject, PARSED_COLOR_TYPE, Point, SHAPE, Tuple4Number } from '@antv/g';
import { DeviceProgram } from '../render/DeviceProgram';
import { Batch, AttributeLocation } from './Batch';
import { ShapeRenderer } from '../tokens';

export const segmentInstanceGeometry = [0, -0.5, 0, 0, 1, -0.5, 1, 0, 1, 0.5, 1, 1, 0, 0.5, 0, 1];

export class InstancedLineProgram extends DeviceProgram {
  static a_Position = AttributeLocation.MAX;
  static a_PointA = AttributeLocation.MAX + 1;
  static a_PointB = AttributeLocation.MAX + 2;
  static a_Uv = AttributeLocation.MAX + 3;

  static ub_ObjectParams = 1;

  both: string = `
  ${Batch.ShaderLibrary.BothDeclaration}
  `;

  vert: string = `
  ${Batch.ShaderLibrary.VertDeclaration}
  layout(location = ${InstancedLineProgram.a_Position}) attribute vec2 a_Position;
  layout(location = ${InstancedLineProgram.a_PointA}) attribute vec2 a_PointA;
  layout(location = ${InstancedLineProgram.a_PointB}) attribute vec2 a_PointB;
  #ifdef USE_UV
    layout(location = ${InstancedLineProgram.a_Uv}) attribute vec2 a_Uv;
    varying vec2 v_Uv;
  #endif

  void main() {
    ${Batch.ShaderLibrary.Vert}
    ${Batch.ShaderLibrary.UvVert}

    vec2 xBasis = a_PointB - a_PointA;
    vec2 yBasis = normalize(vec2(-xBasis.y, xBasis.x));
    vec2 point = a_PointA + xBasis * a_Position.x + yBasis * u_StrokeWidth * a_Position.y;

    point = point - a_Anchor.xy * abs(xBasis);

    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * vec4(point, 0.0, 1.0);
  }
  `;

  frag: string = `
  ${Batch.ShaderLibrary.FragDeclaration}
  ${Batch.ShaderLibrary.UvFragDeclaration}
  ${Batch.ShaderLibrary.MapFragDeclaration}
  
  void main() {
    ${Batch.ShaderLibrary.Frag}
    ${Batch.ShaderLibrary.MapFrag}

    gl_FragColor = u_StrokeColor;
    #ifdef USE_MAP
      gl_FragColor = u_Color;
    #endif
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
@injectable({
  token: { token: ShapeRenderer, named: SHAPE.Line },
})
export class InstancedLineRenderer extends Batch {
  protected program = new InstancedLineProgram();

  validate(object: DisplayObject) {
    // should split when using gradient & pattern
    const instance = this.instance;
    if (instance.nodeName === SHAPE.Line) {
      const source = instance.parsedStyle.stroke as ParsedColorStyleProperty;
      const target = object.parsedStyle.stroke as ParsedColorStyleProperty;

      // can't be merged if stroke's types are different
      if (source.type !== target.type) {
        return false;
      }

      // compare hash directly
      if (
        source.type !== PARSED_COLOR_TYPE.Constant &&
        target.type !== PARSED_COLOR_TYPE.Constant
      ) {
        return source.value.hash === target.value.hash;
      }
    }

    return true;
  }

  buildGeometry() {
    const interleaved = [];
    const indices = [];
    let offset = 0;
    this.objects.forEach((object) => {
      if (object.nodeName === SHAPE.Line) {
        const line = object as Line;
        const { x1, y1, x2, y2, defX, defY } = line.parsedStyle;
        interleaved.push(x1 - defX, y1 - defY, x2 - defX, y2 - defY);
        indices.push(0 + offset, 2 + offset, 1 + offset, 0 + offset, 3 + offset, 2 + offset);
        offset += 4;
      }
    });

    this.geometry.setIndices(new Uint32Array(indices));
    this.geometry.vertexCount = 6;
    // this.geometry.maxInstancedCount = indices.length / 6;
    this.geometry.setVertexBuffer({
      bufferIndex: 1,
      byteStride: 4 * 4,
      frequency: VertexBufferFrequency.PerInstance,
      attributes: [
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 0,
          location: InstancedLineProgram.a_Position,
          divisor: 0,
        },
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 2,
          location: InstancedLineProgram.a_Uv,
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
    renderInst.setBindingLayouts([{ numUniformBuffers: 1, numSamplers: 1 }]);
    renderInst.setSamplerBindingsFromTextureMappings([this.mapping]);
  }
}
