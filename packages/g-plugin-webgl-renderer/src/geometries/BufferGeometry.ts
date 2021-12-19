import { EventEmitter } from 'eventemitter3';
import { Mesh } from '../Mesh';
import {
  Buffer,
  BufferFrequencyHint,
  BufferUsage,
  Device,
  Format,
  InputLayoutDescriptor,
  PrimitiveTopology,
  VertexBufferFrequency,
} from '../platform';
import { GeometryVertexBufferDescriptor, IndicesArray } from './Geometry';

export abstract class BufferGeometry<GeometryProps = any> extends EventEmitter {
  /**
   * 绘制模式
   */
  drawMode: PrimitiveTopology = PrimitiveTopology.Triangles;

  indices: IndicesArray;

  inputLayoutDescriptor: InputLayoutDescriptor = {
    vertexBufferDescriptors: [],
    vertexAttributeDescriptors: [],
    indexBufferFormat: Format.U32_R,
  };

  vertexBuffers: ArrayBufferView[] = [];

  vertexCount: number = 0;

  instancedCount: number = 0;

  dirty = true;

  abstract build(meshes: Mesh<GeometryProps>[]): void;

  setIndices(indices: IndicesArray) {
    this.indices = indices;
  }

  // updateIndices(indices: IndicesArray, offset: number = 0) {
  //   if (this.indicesBuffer) {
  //     this.indicesBuffer.setSubData(
  //       offset,
  //       ArrayBuffer.isView(indices) ? indices : new Uint32Array(indices),
  //     );
  //   }
  //   return this;
  // }

  setVertexBuffer(descriptor: GeometryVertexBufferDescriptor) {
    const { bufferIndex, byteStride, frequency, attributes, data } = descriptor;

    this.inputLayoutDescriptor.vertexBufferDescriptors[bufferIndex] = {
      byteStride,
      frequency,
    };

    attributes.forEach(({ format, bufferByteOffset, location, divisor, byteStride }) => {
      const existed = this.inputLayoutDescriptor.vertexAttributeDescriptors.find(
        (e) => e.bufferIndex === bufferIndex && e.location === location,
      );
      if (existed) {
        existed.format = format;
        existed.bufferByteOffset = bufferByteOffset;
        existed.byteStride = byteStride;
        existed.divisor = divisor;
      } else {
        this.inputLayoutDescriptor.vertexAttributeDescriptors.push({
          format,
          bufferIndex,
          bufferByteOffset,
          location,
          byteStride,
          divisor,
        });
      }
    });

    this.vertexBuffers[bufferIndex] = data;
  }
}
