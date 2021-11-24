import {
  Buffer,
  BufferFrequencyHint,
  BufferUsage,
  Device,
  Format,
  InputLayoutDescriptor,
  PrimitiveTopology,
  VertexBufferFrequency,
} from './platform';
import { align } from './platform/utils';
import { translateBufferUsage } from './platform/webgpu/utils';

export type IndicesArray = number[] | Int32Array | Uint32Array | Uint16Array;

// built-in attribute name
export const enum Attribute {
  Position,
  Color,
  Normal,
}

export interface VertexBufferDescriptor {
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
  // flags: number,
  data: ArrayBufferLike,
): Buffer {
  const buffer = device.createBuffer({
    viewOrSize: align(data.byteLength, 4) / 4,
    // flags,
    usage,
    hint: BufferFrequencyHint.Static,
  });
  buffer.setSubData(0, new Uint8Array(data));
  return buffer;
}

export class Geometry {
  drawMode: PrimitiveTopology = PrimitiveTopology.Triangles;

  device: Device;

  vertexBuffers: Buffer[] = [];
  indicesBuffer: Buffer;

  inputLayoutDescriptor: InputLayoutDescriptor = {
    vertexBufferDescriptors: [],
    vertexAttributeDescriptors: [],
    indexBufferFormat: Format.U32_R,
  };

  vertexCount: number = 0;

  // instanced count
  maxInstancedCount: number;

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
    this.maxInstancedCount = 0;
  }

  setVertexBuffer(descriptor: VertexBufferDescriptor) {
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

    const buffer = makeStaticDataBuffer(
      this.device,
      BufferUsage.Vertex,
      // translateBufferUsage(BufferUsage.Vertex),
      data.buffer,
    );
    this.vertexBuffers[bufferIndex] = buffer;

    return this;
  }

  getVertexBuffer(bufferIndex: number) {
    return this.vertexBuffers[bufferIndex];
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
      BufferUsage.Index,
      // translateBufferUsage(BufferUsage.Index),
      new Uint32Array(ArrayBuffer.isView(indices) ? indices.buffer : indices).buffer,
    );

    return this;
  }
}
