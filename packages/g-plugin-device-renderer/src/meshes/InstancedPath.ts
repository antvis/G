/**
 * Instanced line which has a  better performance.
 * @see https://www.yuque.com/antv/ou292n/gg1gh5
 */
import { DisplayObject } from '@antv/g-lite';
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
}

enum LineVertexAttributeLocation {
  PREV = VertexAttributeLocation.POSITION,
  POINT1,
  POINT2,
  NEXT,
  VERTEX_JOINT,
  VERTEX_NUM,
  TRAVEL,
}

/**
 * Used for Path only contains 2 commands, e.g. [[M], [C]]
 */
export class InstancedPathMesh extends Instanced {
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
    let instancedCount = 0;
    let offset = 0;
    objects.forEach((object) => {
      const {
        pointsBuffer: pBuffer,
        travelBuffer: tBuffer,
        instancedCount: count,
      } = updateBuffer(object);

      instancedCount += count;

      pointsBuffer.push(...pBuffer);
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
          byteStride: 4 * 3,
          location: LineVertexAttributeLocation.PREV,
          divisor: 1,
        },
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 3,
          byteStride: 4 * 3,
          location: LineVertexAttributeLocation.POINT1,
          divisor: 1,
        },
        {
          format: Format.F32_R,
          bufferByteOffset: 4 * 5,
          byteStride: 4 * 3,
          location: LineVertexAttributeLocation.VERTEX_JOINT,
          divisor: 1,
        },
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 6,
          byteStride: 4 * 3,
          location: LineVertexAttributeLocation.POINT2,
          divisor: 1,
        },
        {
          format: Format.F32_RG,
          bufferByteOffset: 4 * 9,
          byteStride: 4 * 3,
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

    // this attribute only changes for each 9 instance
    this.divisor = instancedCount / objects.length;
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
  }
}
