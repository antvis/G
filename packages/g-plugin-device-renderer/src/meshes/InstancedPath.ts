/**
 * Instanced line which has a  better performance.
 * @see https://www.yuque.com/antv/ou292n/gg1gh5
 */
import { DisplayObject, ParsedPathStyleProps, Path, Shape } from '@antv/g-lite';
import { Format, VertexBufferFrequency } from '../platform';
import frag from '../shader/line.frag';
import vert from '../shader/line.vert';
import { enumToObject } from '../utils/enum';
import {
  Instanced,
  VertexAttributeBufferIndex,
  VertexAttributeLocation,
} from './Instanced';
import { updateBuffer } from './Line';

enum LineVertexAttributeBufferIndex {
  PACKED = VertexAttributeBufferIndex.POSITION + 1,
  VERTEX_NUM,
  TRAVEL,
  DASH,
}

enum LineVertexAttributeLocation {
  PREV = VertexAttributeLocation.POSITION,
  POINT1,
  POINT2,
  NEXT,
  VERTEX_JOINT,
  VERTEX_NUM,
  TRAVEL,
  DASH,
}

const SEGMENT_NUM = 12;

/**
 * Used for Curve only contains 2 commands, e.g. [[M], [C | Q | A]]
 */
export class InstancedPathMesh extends Instanced {
  static isOneCommandCurve(object: DisplayObject) {
    if (object.nodeName === Shape.PATH) {
      const {
        path: { absolutePath },
      } = object.parsedStyle as ParsedPathStyleProps;
      if (
        absolutePath.length === 2 &&
        absolutePath[0][0] === 'M' &&
        (absolutePath[1][0] === 'C' ||
          absolutePath[1][0] === 'A' ||
          absolutePath[1][0] === 'Q')
      ) {
        return true;
      }
    }
    return false;
  }

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
      ...enumToObject(LineVertexAttributeLocation),
      INSTANCED: true,
    };
  }

  createGeometry(objects: DisplayObject[]): void {
    const indices: number[] = [];
    const pointsBuffer: number[] = [];
    const travelBuffer: number[] = [];
    const packedDash: number[] = [];
    let instancedCount = 0;
    let offset = 0;
    objects.forEach((object) => {
      const {
        pointsBuffer: pBuffer,
        travelBuffer: tBuffer,
        instancedCount: count,
      } = updateBuffer(object, false, SEGMENT_NUM);

      const { lineDash, lineDashOffset, isBillboard } = (object as Path)
        .parsedStyle;

      packedDash.push(
        (lineDash && lineDash[0]) || 0, // DASH
        (lineDash && lineDash[1]) || 0, // GAP
        lineDashOffset || 0,
        isBillboard ? 1 : 0,
      );

      instancedCount += count;

      // Can't use interleaved buffer here, we should spread them like:
      // | prev - pointA - pointB - next |. This will allocate ~4x buffer memory space.
      for (let i = 0; i < pBuffer.length - 3 * 3; i += 3) {
        pointsBuffer.push(
          pBuffer[i],
          pBuffer[i + 1],
          pBuffer[i + 2],
          pBuffer[i + 3],
          pBuffer[i + 4],
          pBuffer[i + 5],
          pBuffer[i + 6],
          pBuffer[i + 7],
          pBuffer[i + 8],
          pBuffer[i + 9],
          pBuffer[i + 10],
          pBuffer[i + 11],
        );
      }

      travelBuffer.push(...tBuffer);

      indices.push(
        0 + offset,
        2 + offset,
        1 + offset,
        0 + offset,
        3 + offset,
        2 + offset,
        4 + offset,
        6 + offset,
        5 + offset,
        4 + offset,
        7 + offset,
        6 + offset,
        4 + offset,
        7 + offset,
        8 + offset,
      );
      offset += 9;
    });

    this.geometry.setVertexBuffer({
      bufferIndex: LineVertexAttributeBufferIndex.PACKED,
      byteStride: 4 * (3 + 3 + 3 + 3),
      frequency: VertexBufferFrequency.PerInstance,
      attributes: [
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 0,
          location: LineVertexAttributeLocation.PREV,
          divisor: 1,
        },
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 3,
          location: LineVertexAttributeLocation.POINT1,
          divisor: 1,
        },
        {
          format: Format.F32_R,
          bufferByteOffset: 4 * 5,
          location: LineVertexAttributeLocation.VERTEX_JOINT,
          divisor: 1,
        },
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 6,
          location: LineVertexAttributeLocation.POINT2,
          divisor: 1,
        },
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 9,
          location: LineVertexAttributeLocation.NEXT,
          divisor: 1,
        },
      ],
      data: new Float32Array(pointsBuffer),
    });
    this.geometry.setVertexBuffer({
      bufferIndex: LineVertexAttributeBufferIndex.VERTEX_NUM,
      byteStride: 4 * 1,
      frequency: VertexBufferFrequency.PerInstance,
      attributes: [
        {
          format: Format.F32_R,
          bufferByteOffset: 4 * 0,
          byteStride: 4 * 1,
          location: LineVertexAttributeLocation.VERTEX_NUM,
          divisor: 0,
        },
      ],
      data: new Float32Array([0, 1, 2, 3, 4, 5, 6, 7, 8]),
    });
    this.geometry.setVertexBuffer({
      bufferIndex: LineVertexAttributeBufferIndex.TRAVEL,
      byteStride: 4 * 1,
      frequency: VertexBufferFrequency.PerInstance,
      attributes: [
        {
          format: Format.F32_R,
          bufferByteOffset: 4 * 0,
          byteStride: 4 * 1,
          location: LineVertexAttributeLocation.TRAVEL,
          divisor: 1,
        },
      ],
      data: new Float32Array(travelBuffer),
    });

    // this attribute only changes for each n instance
    this.divisor = instancedCount / objects.length;

    this.geometry.setVertexBuffer({
      bufferIndex: LineVertexAttributeBufferIndex.DASH,
      byteStride: 4 * 4,
      frequency: VertexBufferFrequency.PerInstance,
      attributes: [
        {
          format: Format.F32_RGBA,
          bufferByteOffset: 4 * 0,
          location: LineVertexAttributeLocation.DASH,
          divisor: this.divisor,
        },
      ],
      data: new Float32Array(packedDash),
    });

    // use default common attributes
    super.createGeometry(objects);

    this.geometry.vertexCount = 15;
    this.geometry.instancedCount = instancedCount;
    this.geometry.setIndexBuffer(new Uint32Array(indices));
  }

  updateAttribute(
    objects: DisplayObject[],
    startIndex: number,
    name: string,
    value: any,
  ) {
    super.updateAttribute(objects, startIndex, name, value);

    this.updateBatchedAttribute(objects, startIndex, name, value);

    if (
      name === 'path' ||
      name === 'markerStartOffset' ||
      name === 'markerEndOffset' ||
      name === 'markerStart' ||
      name === 'markerEnd'
    ) {
      const pointsBuffer: number[] = [];
      const travelBuffer: number[] = [];
      let instancedCount = 0;
      objects.forEach((object) => {
        const {
          pointsBuffer: pBuffer,
          travelBuffer: tBuffer,
          instancedCount: iCount,
        } = updateBuffer(object, false, SEGMENT_NUM);
        instancedCount = iCount;

        // Can't use interleaved buffer here, we should spread them like:
        // | prev - pointA - pointB - next |. This will allocate ~4x buffer memory space.
        for (let i = 0; i < pBuffer.length - 3 * 3; i += 3) {
          pointsBuffer.push(
            pBuffer[i],
            pBuffer[i + 1],
            pBuffer[i + 2],
            pBuffer[i + 3],
            pBuffer[i + 4],
            pBuffer[i + 5],
            pBuffer[i + 6],
            pBuffer[i + 7],
            pBuffer[i + 8],
            pBuffer[i + 9],
            pBuffer[i + 10],
            pBuffer[i + 11],
          );
        }

        travelBuffer.push(...tBuffer);
      });

      this.geometry.updateVertexBuffer(
        LineVertexAttributeBufferIndex.PACKED,
        LineVertexAttributeLocation.PREV,
        startIndex * instancedCount,
        new Uint8Array(new Float32Array(pointsBuffer).buffer),
      );
      this.geometry.updateVertexBuffer(
        LineVertexAttributeBufferIndex.TRAVEL,
        LineVertexAttributeLocation.TRAVEL,
        startIndex,
        new Uint8Array(new Float32Array(travelBuffer).buffer),
      );
    } else if (
      name === 'lineDashOffset' ||
      name === 'lineDash' ||
      name === 'isBillboard'
    ) {
      const packedDash: number[] = [];
      objects.forEach((object) => {
        const { lineDash, lineDashOffset, isBillboard } = (object as Path)
          .parsedStyle;

        packedDash.push(
          (lineDash && lineDash[0]) || 0, // DASH
          (lineDash && lineDash[1]) || 0, // GAP
          lineDashOffset || 0,
          isBillboard ? 1 : 0,
        );
      });

      this.geometry.updateVertexBuffer(
        LineVertexAttributeBufferIndex.DASH,
        LineVertexAttributeBufferIndex.DASH,
        startIndex,
        new Uint8Array(new Float32Array(packedDash).buffer),
      );
    }
  }
}
