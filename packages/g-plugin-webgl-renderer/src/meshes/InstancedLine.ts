import { injectable } from 'mana-syringe';
import type { Line, DisplayObject, ParsedColorStyleProperty } from '@antv/g';
import { LineCap, Shape, PARSED_COLOR_TYPE } from '@antv/g';
import { Format, VertexBufferFrequency } from '../platform';
import vert from '../shader/instanced-line.vert';
import frag from '../shader/instanced-line.frag';
import { Instanced, VertexAttributeBufferIndex, VertexAttributeLocation } from './Instanced';
import { enumToObject } from '../utils/enum';

export const segmentInstanceGeometry = [
  0, -0.5, 0, 0, 0, 1, -0.5, 1, 1, 0, 1, 0.5, 1, 1, 1, 0, 0.5, 0, 0, 1,
];

enum InstancedLineVertexAttributeBufferIndex {
  POINT = VertexAttributeBufferIndex.MAX,
  CAP,
  DASH,
}

enum InstancedLineVertexAttributeLocation {
  POSITION = VertexAttributeLocation.POSITION,
  UV = VertexAttributeLocation.UV,
  POINTA = VertexAttributeLocation.NORMAL,
  POINTB = VertexAttributeLocation.BARYCENTRIC,
  CAP = VertexAttributeLocation.MAX,
  DASH = VertexAttributeLocation.MAX + 1,
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

    const interleaved: number[] = [];
    const packedCap: number[] = [];
    const packedDash: number[] = [];
    const indices: number[] = [];
    let offset = 0;
    objects.forEach((object) => {
      const line = object as Line;
      const { x1, y1, x2, y2, z1, z2, defX, defY, lineCap, isBillboard } = line.parsedStyle;

      const { dashOffset, dashSegmentPercent, dashRatioInEachSegment } = this.calcDash(
        object as Line,
      );

      packedCap.push(
        // caps
        LineCap_MAP[lineCap],
      );
      packedDash.push(
        dashOffset,
        dashSegmentPercent,
        dashRatioInEachSegment,
        // isBillboard
        isBillboard ? 1 : 0,
      );

      interleaved.push(x1 - defX, y1 - defY, z1, x2 - defX, y2 - defY, z2);
      indices.push(0 + offset, 2 + offset, 1 + offset, 0 + offset, 3 + offset, 2 + offset);
      offset += 4;
    });

    this.geometry.setIndexBuffer(new Uint32Array(indices));
    this.geometry.vertexCount = 6;
    this.geometry.setVertexBuffer({
      bufferIndex: VertexAttributeBufferIndex.POSITION,
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
      bufferIndex: InstancedLineVertexAttributeBufferIndex.POINT,
      byteStride: 4 * (3 + 3),
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
      ],
      data: new Float32Array(interleaved),
    });

    this.geometry.setVertexBuffer({
      bufferIndex: InstancedLineVertexAttributeBufferIndex.CAP,
      byteStride: 4 * 1,
      frequency: VertexBufferFrequency.PerInstance,
      attributes: [
        {
          format: Format.F32_R,
          bufferByteOffset: 4 * 0,
          location: InstancedLineVertexAttributeLocation.CAP,
          divisor: 1,
        },
      ],
      data: new Float32Array(packedCap),
    });
    this.geometry.setVertexBuffer({
      bufferIndex: InstancedLineVertexAttributeBufferIndex.DASH,
      byteStride: 4 * 4,
      frequency: VertexBufferFrequency.PerInstance,
      attributes: [
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 0,
          location: InstancedLineVertexAttributeLocation.DASH,
          divisor: 1,
        },
      ],
      data: new Float32Array(packedDash),
    });
  }

  updateAttribute(objects: DisplayObject[], startIndex: number, name: string, value: any) {
    super.updateAttribute(objects, startIndex, name, value);

    this.updateBatchedAttribute(objects, startIndex, name, value);

    if (
      name === 'x1' ||
      name === 'y1' ||
      name === 'x2' ||
      name === 'y2' ||
      name === 'z1' ||
      name === 'z2'
    ) {
      const packed: number[] = [];
      objects.forEach((object) => {
        const { x1, y1, x2, y2, z1, z2, defX, defY } = object.parsedStyle;
        packed.push(x1 - defX, y1 - defY, z1, x2 - defX, y2 - defY, z2);
      });

      this.geometry.updateVertexBuffer(
        InstancedLineVertexAttributeBufferIndex.POINT,
        InstancedLineVertexAttributeLocation.POINTA,
        startIndex,
        new Uint8Array(new Float32Array(packed).buffer),
      );
    } else if (name === 'lineDashOffset' || name === 'lineDash') {
      const packed: number[] = [];
      objects.forEach((object) => {
        const { dashOffset, dashSegmentPercent, dashRatioInEachSegment } = this.calcDash(
          object as Line,
        );
        packed.push(
          dashOffset,
          dashSegmentPercent,
          dashRatioInEachSegment, // isBillboard
          object.parsedStyle.isBillboard ? 1 : 0,
        );
      });

      this.geometry.updateVertexBuffer(
        InstancedLineVertexAttributeBufferIndex.DASH,
        InstancedLineVertexAttributeLocation.DASH,
        startIndex,
        new Uint8Array(new Float32Array(packed).buffer),
      );
    } else if (name === 'lineCap') {
      const packed: number[] = [];
      objects.forEach((object) => {
        const { lineCap } = object.parsedStyle;
        packed.push(LineCap_MAP[lineCap]);
      });
      this.geometry.updateVertexBuffer(
        InstancedLineVertexAttributeBufferIndex.CAP,
        InstancedLineVertexAttributeLocation.CAP,
        startIndex,
        new Uint8Array(new Float32Array(packed).buffer),
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
