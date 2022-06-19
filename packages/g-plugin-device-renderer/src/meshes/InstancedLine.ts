import { DisplayObject, injectable, Line, ParsedLineStyleProps } from '@antv/g';
import { Format, VertexBufferFrequency } from '../platform';
import frag from '../shader/instanced-line.frag';
import vert from '../shader/instanced-line.vert';
import { enumToObject } from '../utils/enum';
import { Instanced, VertexAttributeBufferIndex, VertexAttributeLocation } from './Instanced';

export const segmentInstanceGeometry = [
  0, -0.5, 0, 0, 0, 1, -0.5, 1, 1, 0, 1, 0.5, 1, 1, 1, 0, 0.5, 0, 0, 1,
];

enum InstancedLineVertexAttributeBufferIndex {
  POINT = VertexAttributeBufferIndex.POSITION + 1,
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
  butt: 1,
  round: 2,
  square: 3,
};

@injectable()
export class InstancedLineMesh extends Instanced {
  shouldMerge(object: DisplayObject, index: number) {
    const shouldMerge = super.shouldMerge(object, index);
    if (!shouldMerge) {
      return false;
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
      const { x1, y1, x2, y2, z1, z2, defX, defY, lineCap, isBillboard } =
        line.parsedStyle as ParsedLineStyleProps;

      const { dashOffset, dashSegmentPercent, dashRatioInEachSegment } = this.calcDash(
        object as Line,
      );

      packedCap.push(
        // caps
        LineCap_MAP[lineCap.value],
      );
      packedDash.push(
        dashOffset,
        dashSegmentPercent,
        dashRatioInEachSegment,
        // isBillboard
        isBillboard ? 1 : 0,
      );

      interleaved.push(
        x1.value - defX,
        y1.value - defY,
        z1.value,
        x2.value - defX,
        y2.value - defY,
        z2.value,
      );
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
        const { x1, y1, x2, y2, z1, z2, defX, defY } = object.parsedStyle as ParsedLineStyleProps;
        packed.push(
          x1.value - defX,
          y1.value - defY,
          z1.value,
          x2.value - defX,
          y2.value - defY,
          z2.value,
        );
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
    const { lineDash, lineDashOffset } = line.parsedStyle as ParsedLineStyleProps;
    const totalLength = line.getTotalLength();
    let dashOffset = 0;
    let dashSegmentPercent = 1;
    let dashRatioInEachSegment = 0;
    if (lineDash && lineDash.length) {
      dashOffset = ((lineDashOffset && lineDashOffset.value) || 0) / totalLength;
      const segmentsLength = lineDash.reduce((cur, prev) => cur + prev.value, 0);
      dashSegmentPercent = segmentsLength / totalLength;
      dashRatioInEachSegment = lineDash[1].value / segmentsLength;
    }
    return {
      dashOffset,
      dashSegmentPercent,
      dashRatioInEachSegment,
    };
  }
}
