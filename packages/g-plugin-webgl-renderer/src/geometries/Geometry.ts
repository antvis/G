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
import { align } from '../platform/utils';

export type IndicesArray = number[] | Int32Array | Uint32Array | Uint16Array;

// built-in attribute name
export enum Attribute {
  Position,
  Color,
  Normal,
}

export interface GeometryVertexBufferDescriptor {
  bufferIndex: number;
  byteStride: number;
  frequency: VertexBufferFrequency;
  attributes: Array<{
    format: Format;
    bufferByteOffset: number;
    byteStride?: number;
    location: number;
    divisor?: number;
  }>;
  data: ArrayBufferView;
}

export function makeStaticDataBuffer(
  device: Device,
  usage: BufferUsage,
  data: ArrayBufferLike,
): Buffer {
  const buffer = device.createBuffer({
    viewOrSize: align(data.byteLength, 4) / 4,
    usage,
    hint: BufferFrequencyHint.Static,
  });
  buffer.setSubData(0, new Uint8Array(data));
  return buffer;
}

export class Geometry {
  /**
   * 绘制模式
   */
  drawMode: PrimitiveTopology = PrimitiveTopology.Triangles;

  /**
   * 硬件抽象层，提供 GPU 能力，例如创建 Buffer
   */
  device: Device;

  /**
   * 存放 Attribute Buffer 列表
   */
  vertexBuffers: Buffer[] = [];

  /**
   * 存放 Index Buffer
   */
  indicesBuffer: Buffer;

  /**
   * start of indices
   */
  indexStart: number = 0;

  primitiveStart: number = 0;

  inputLayoutDescriptor: InputLayoutDescriptor = {
    vertexBufferDescriptors: [],
    vertexAttributeDescriptors: [],
    indexBufferFormat: Format.U32_R,
  };

  vertexCount: number = 0;

  // instanced count
  instancedCount: number;

  init?(): void;

  destroy() {
    this.vertexBuffers.forEach((buffer) => {
      if (buffer) {
        buffer.destroy();
      }
    });

    if (this.indicesBuffer) {
      this.indicesBuffer.destroy();
    }

    this.indicesBuffer = undefined;
    this.vertexBuffers = [];
    this.vertexCount = 0;
    this.instancedCount = 0;
  }

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

    // create GPUBuffer
    if (this.vertexBuffers[bufferIndex]) {
      this.vertexBuffers[bufferIndex].destroy();
    }

    const buffer = makeStaticDataBuffer(this.device, BufferUsage.VERTEX, data.buffer);
    this.vertexBuffers[bufferIndex] = buffer;

    return this;
  }

  getVertexBuffer(bufferIndex: number) {
    return this.vertexBuffers[bufferIndex];
  }

  updateVertexBufferData(bufferIndex: number, offset: number, data: Uint8Array) {
    const vertexBuffer = this.getVertexBuffer(bufferIndex);
    if (vertexBuffer) {
      vertexBuffer.setSubData(offset, data);
    }
  }

  updateVertexBuffer(bufferIndex: number, location: number, index: number, data: Uint8Array) {
    const { byteStride } = this.inputLayoutDescriptor.vertexBufferDescriptors[bufferIndex];

    const descriptor = this.inputLayoutDescriptor.vertexAttributeDescriptors.find(
      (d) => d.location === location,
    );

    if (descriptor) {
      const vertexBuffer = this.getVertexBuffer(bufferIndex);
      const offset = index * byteStride;
      vertexBuffer.setSubData(descriptor.bufferByteOffset + offset, data);
    }
  }

  updateIndices(indices: IndicesArray, offset: number = 0) {
    if (this.indicesBuffer) {
      this.indicesBuffer.setSubData(
        offset,
        ArrayBuffer.isView(indices) ? indices : new Uint32Array(indices),
      );
    }
    return this;
  }

  setIndices(indices: IndicesArray) {
    if (this.indicesBuffer) {
      this.indicesBuffer.destroy();
    }

    this.indicesBuffer = makeStaticDataBuffer(
      this.device,
      BufferUsage.INDEX,
      new Uint32Array(ArrayBuffer.isView(indices) ? indices.buffer : indices).buffer,
    );

    return this;
  }
}
