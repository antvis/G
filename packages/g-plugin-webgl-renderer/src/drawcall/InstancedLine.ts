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
  DisplayObject,
  PARSED_COLOR_TYPE,
  Point,
  SHAPE,
  Tuple4Number,
} from '@antv/g';
import { fillMatrix4x4, fillVec4, makeSortKeyOpaque, RendererLayer } from '../render/utils';
import { CullMode, Format, VertexBufferFrequency } from '../platform';
import { RenderInst } from '../render/RenderInst';
import { DeviceProgram } from '../render/DeviceProgram';
import { Batch, AttributeLocation } from './Batch';
import { ShapeMesh, ShapeRenderer } from '../tokens';
import vert from '../shader/instanced-line.vert';
import frag from '../shader/instanced-line.frag';
import { BatchMesh } from './BatchMesh';

export const segmentInstanceGeometry = [
  0, -0.5, 0, 0, 0, 1, -0.5, 1, 1, 0, 1, 0.5, 1, 1, 1, 0, 0.5, 0, 0, 1,
];

enum InstancedLineProgram {
  a_Position = AttributeLocation.MAX,
  a_PointA,
  a_PointB,
  a_Cap,
  a_Uv,
  a_Dash,
}

const LINE_CAP_MAP = {
  [LINE_CAP.Butt]: 1,
  [LINE_CAP.Round]: 2,
  [LINE_CAP.Square]: 3,
};

@injectable({
  token: [{ token: ShapeMesh, named: SHAPE.Line }],
})
export class InstancedLineBatchMesh extends BatchMesh {
  protected createMaterial(objects: DisplayObject[]): void {
    this.material.vertexShader = vert;
    this.material.fragmentShader = frag;
  }

  protected createGeometry(objects: DisplayObject[]): void {
    // use default common attributes
    this.createBatchedGeometry(objects);

    const interleaved = [];
    const indices = [];
    let offset = 0;
    objects.forEach((object) => {
      const line = object as Line;
      const { x1, y1, x2, y2, z1, z2, defX, defY, lineCap, isBillboard } = line.parsedStyle;

      const { dashOffset, dashSegmentPercent, dashRatioInEachSegment } = this.calcDash(
        object as Line,
      );

      interleaved.push(
        x1 - defX,
        y1 - defY,
        z1,
        x2 - defX,
        y2 - defY,
        z2,
        // caps
        LINE_CAP_MAP[lineCap],
        // dash
        dashOffset,
        dashSegmentPercent,
        dashRatioInEachSegment,
        // isBillboard
        isBillboard ? 1 : 0,
      );
      indices.push(0 + offset, 2 + offset, 1 + offset, 0 + offset, 3 + offset, 2 + offset);
      offset += 4;
    });

    this.bufferGeometry.setIndices(new Uint32Array(indices));
    this.bufferGeometry.vertexCount = 6;
    this.bufferGeometry.setVertexBuffer({
      bufferIndex: 1,
      byteStride: 4 * 5,
      frequency: VertexBufferFrequency.PerInstance,
      attributes: [
        {
          format: Format.F32_RGB,
          bufferByteOffset: 4 * 0,
          location: InstancedLineProgram.a_Position,
          divisor: 0,
        },
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 3,
          location: InstancedLineProgram.a_Uv,
          divisor: 0,
        },
      ],
      data: new Float32Array(segmentInstanceGeometry),
    });
    this.bufferGeometry.setVertexBuffer({
      bufferIndex: 2,
      byteStride: 4 * (3 + 3 + 1 + 4),
      frequency: VertexBufferFrequency.PerInstance,
      attributes: [
        {
          format: Format.F32_RGB,
          bufferByteOffset: 4 * 0,
          location: InstancedLineProgram.a_PointA,
          divisor: 1,
        },
        {
          format: Format.F32_RGB,
          bufferByteOffset: 4 * 3,
          location: InstancedLineProgram.a_PointB,
          divisor: 1,
        },
        {
          format: Format.F32_R,
          bufferByteOffset: 4 * 6,
          location: InstancedLineProgram.a_Cap,
          divisor: 1,
        },
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 7,
          location: InstancedLineProgram.a_Dash,
          divisor: 1,
        },
      ],
      data: new Float32Array(interleaved),
    });
  }

  protected updateMeshAttribute(object: DisplayObject, index: number, name: string, value: any) {
    this.updateBatchedAttribute(object, index, name, value);

    const { x1, y1, x2, y2, z1, z2, defX, defY, lineCap } = object.parsedStyle;

    if (
      name === 'x1' ||
      name === 'y1' ||
      name === 'x2' ||
      name === 'y2' ||
      name === 'z1' ||
      name === 'z2'
    ) {
      this.geometry.updateVertexBuffer(
        2,
        InstancedLineProgram.a_PointA,
        index,
        new Uint8Array(
          new Float32Array([x1 - defX, y1 - defY, z1, x2 - defX, y2 - defY, z2]).buffer,
        ),
      );
    } else if (name === 'lineDashOffset' || name === 'lineDash') {
      const { dashOffset, dashSegmentPercent, dashRatioInEachSegment } = this.calcDash(
        object as Line,
      );
      this.geometry.updateVertexBuffer(
        2,
        InstancedLineProgram.a_Dash,
        index,
        new Uint8Array(
          new Float32Array([dashOffset, dashSegmentPercent, dashRatioInEachSegment]).buffer,
        ),
      );
    } else if (name === 'lineCap') {
      this.geometry.updateVertexBuffer(
        2,
        InstancedLineProgram.a_Cap,
        index,
        new Uint8Array(new Float32Array([LINE_CAP_MAP[lineCap]]).buffer),
      );
    }
  }

  private calcDash(line: Line) {
    const { lineDash, lineDashOffset = 0 } = line.parsedStyle;
    const totalLength = line.getTotalLength();
    let dashOffset = 0;
    let dashSegmentPercent = 1;
    let dashRatioInEachSegment = 0;
    if (lineDash && lineDash.length) {
      dashOffset = lineDashOffset / totalLength;
      const segmentsLength = lineDash.reduce((cur, prev) => cur + prev, 0);
      dashSegmentPercent = segmentsLength / totalLength;
      dashRatioInEachSegment = lineDash[0] / segmentsLength;
    }
    return {
      dashOffset,
      dashSegmentPercent,
      dashRatioInEachSegment,
    };
  }
}

/**
 * use instanced for each segment
 * @see https://blog.scottlogic.com/2019/11/18/drawing-lines-with-webgl.html
 *
 * support dash array
 * TODO: joint & cap
 */
@injectable({
  token: { token: ShapeRenderer, named: SHAPE.Line },
})
export class InstancedLineRenderer extends Batch {
  protected createBatchMeshList(): void {
    this.batchMeshList.push(this.meshFactory(SHAPE.Line));
  }

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
}
