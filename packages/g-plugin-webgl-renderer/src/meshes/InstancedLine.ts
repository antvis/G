import { injectable } from 'mana-syringe';
import {
  Line,
  LineCap,
  DisplayObject,
  Shape,
  ParsedColorStyleProperty,
  PARSED_COLOR_TYPE,
} from '@antv/g';
import { Format, VertexBufferFrequency } from '../platform';
import vert from '../shader/instanced-line.vert';
import frag from '../shader/instanced-line.frag';
import { Instanced, VertexAttributeBufferIndex } from './Instanced';
import { VertexAttributeLocation } from '../geometries';
import { enumToObject } from '../utils/enum';

export const segmentInstanceGeometry = [
  0, -0.5, 0, 0, 0, 1, -0.5, 1, 1, 0, 1, 0.5, 1, 1, 1, 0, 0.5, 0, 0, 1,
];

enum InstancedLineVertexAttributeBufferIndex {
  POSITION_UV = VertexAttributeBufferIndex.MAX,
  POINT_CAP_DASH,
}

enum InstancedLineVertexAttributeLocation {
  POSITION = VertexAttributeLocation.MAX,
  POINTA,
  POINTB,
  CAP,
  UV,
  DASH,
}

const LineCap_MAP = {
  [LineCap.BUTT]: 1,
  [LineCap.ROUND]: 2,
  [LineCap.SQUARE]: 3,
};

@injectable()
export class InstancedLineMesh extends Instanced {
  shouldMerge(object: DisplayObject, index: number) {
    const shouldMerge = super.shouldMerge(object, index);
    if (!shouldMerge) {
      return false;
    }

    // should split when using gradient & pattern
    const instance = this.instance;
    if (instance.nodeName === Shape.LINE) {
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

  createMaterial(objects: DisplayObject[]): void {
    this.material.vertexShader = vert;
    this.material.fragmentShader = frag;
    this.material.defines = {
      ...this.material.defines,
      ...enumToObject(InstancedLineVertexAttributeLocation),
    };
  }

  createGeometry(objects: DisplayObject[]): void {
    // use default common attributes
    super.createGeometry(objects);

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
        LineCap_MAP[lineCap],
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

    this.geometry.setIndexBuffer(new Uint32Array(indices));
    this.geometry.vertexCount = 6;
    this.geometry.setVertexBuffer({
      bufferIndex: InstancedLineVertexAttributeBufferIndex.POSITION_UV,
      byteStride: 4 * 5,
      frequency: VertexBufferFrequency.PerInstance,
      attributes: [
        {
          format: Format.F32_RGB,
          bufferByteOffset: 4 * 0,
          location: InstancedLineVertexAttributeLocation.POSITION,
          divisor: 0,
        },
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 3,
          location: InstancedLineVertexAttributeLocation.UV,
          divisor: 0,
        },
      ],
      data: new Float32Array(segmentInstanceGeometry),
    });
    this.geometry.setVertexBuffer({
      bufferIndex: InstancedLineVertexAttributeBufferIndex.POINT_CAP_DASH,
      byteStride: 4 * (3 + 3 + 1 + 4),
      frequency: VertexBufferFrequency.PerInstance,
      attributes: [
        {
          format: Format.F32_RGB,
          bufferByteOffset: 4 * 0,
          location: InstancedLineVertexAttributeLocation.POINTA,
          divisor: 1,
        },
        {
          format: Format.F32_RGB,
          bufferByteOffset: 4 * 3,
          location: InstancedLineVertexAttributeLocation.POINTB,
          divisor: 1,
        },
        {
          format: Format.F32_R,
          bufferByteOffset: 4 * 6,
          location: InstancedLineVertexAttributeLocation.CAP,
          divisor: 1,
        },
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 7,
          location: InstancedLineVertexAttributeLocation.DASH,
          divisor: 1,
        },
      ],
      data: new Float32Array(interleaved),
    });
  }

  updateAttribute(object: DisplayObject, name: string, value: any) {
    super.updateAttribute(object, name, value);

    const index = this.objects.indexOf(object);
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
        InstancedLineVertexAttributeBufferIndex.POINT_CAP_DASH,
        InstancedLineVertexAttributeLocation.POINTA,
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
        InstancedLineVertexAttributeBufferIndex.POINT_CAP_DASH,
        InstancedLineVertexAttributeLocation.DASH,
        index,
        new Uint8Array(
          new Float32Array([dashOffset, dashSegmentPercent, dashRatioInEachSegment]).buffer,
        ),
      );
    } else if (name === 'lineCap') {
      this.geometry.updateVertexBuffer(
        InstancedLineVertexAttributeBufferIndex.POINT_CAP_DASH,
        InstancedLineVertexAttributeLocation.CAP,
        index,
        new Uint8Array(new Float32Array([LineCap_MAP[lineCap]]).buffer),
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
      dashRatioInEachSegment = lineDash[1] / segmentsLength;
    }
    return {
      dashOffset,
      dashSegmentPercent,
      dashRatioInEachSegment,
    };
  }
}
