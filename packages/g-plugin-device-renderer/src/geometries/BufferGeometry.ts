import { AABB } from '@antv/g-lite';
import EventEmitter from 'eventemitter3';
import type {
  Buffer,
  Device,
  InputLayoutDescriptor,
  VertexStepMode,
} from '@antv/g-device-api';
import {
  BufferFrequencyHint,
  BufferUsage,
  Format,
  PrimitiveTopology,
} from '@antv/g-device-api';
import type { Mesh } from '../Mesh';

export function makeDataBuffer(
  device: Device,
  usage: BufferUsage,
  data: ArrayBufferLike,
  hint = BufferFrequencyHint.STATIC,
): Buffer {
  const buffer = device.createBuffer({
    viewOrSize: data.byteLength,
    usage,
    hint,
  });
  buffer.setSubData(0, new Uint8Array(data));
  return buffer;
}

export type IndicesArray = number[] | Int32Array | Uint32Array | Uint16Array;

export interface GeometryVertexBufferDescriptor {
  bufferIndex: number;
  byteStride: number;
  stepMode: VertexStepMode;
  attributes: {
    format: Format;
    bufferByteOffset: number;
    byteStride?: number;
    location: number;
    divisor?: number;
  }[];
  data: ArrayBufferView;
}

export interface GeometryPatch {
  bufferIndex: number;
  location: number;
  data: ArrayBufferView;
}

export interface VertexBufferToUpdateDescriptor {
  bufferIndex: number;
  bufferByteOffset?: number;
  data: ArrayBufferView;
}

export enum GeometryEvent {
  CHANGED = 'changed',
}

/**
 * just hold descriptors of buffers & indices, won't use underlying GPU resources
 */
export class BufferGeometry<GeometryProps = any> extends EventEmitter {
  drawMode: PrimitiveTopology = PrimitiveTopology.TRIANGLES;

  vertexBuffers: Buffer[] = [];

  vertices: ArrayBufferView[] = [];

  indexBuffer: Buffer;

  indices: IndicesArray;

  inputLayoutDescriptor: InputLayoutDescriptor = {
    vertexBufferDescriptors: [],
    indexBufferFormat: null,
    program: null,
  };

  vertexCount = 0;

  instancedCount = 0;

  indexStart = 0;

  primitiveStart = 0;

  dirty = true;

  meshes: Mesh[] = [];

  constructor(
    public device: Device,
    public props: Partial<GeometryProps> = {},
  ) {
    super();
  }

  validate(mesh: Mesh) {
    return true;
  }

  build(meshes: Mesh<GeometryProps>[]) {}

  computeBoundingBox(): AABB {
    return new AABB();
  }

  setIndexBuffer(indices: IndicesArray) {
    if (this.indexBuffer) {
      this.indexBuffer.destroy();
    }

    this.indexBuffer = makeDataBuffer(
      this.device,
      BufferUsage.INDEX,
      new Uint32Array(ArrayBuffer.isView(indices) ? indices.buffer : indices)
        .buffer,
    );

    this.indices = indices;

    this.inputLayoutDescriptor.indexBufferFormat = Format.U32_R;

    return this;
  }

  setVertexBuffer(descriptor: GeometryVertexBufferDescriptor) {
    const { bufferIndex, byteStride, stepMode, attributes, data } = descriptor;

    this.inputLayoutDescriptor.vertexBufferDescriptors[bufferIndex] = {
      arrayStride: byteStride,
      stepMode,
      attributes: [],
    };

    this.vertices[bufferIndex] = data;

    attributes.forEach(
      ({ format, bufferByteOffset, location, divisor, byteStride }) => {
        const existed = this.inputLayoutDescriptor.vertexBufferDescriptors[
          bufferIndex
        ].attributes.find((e) => e.shaderLocation === location);
        if (existed) {
          existed.format = format;
          existed.offset = bufferByteOffset;
          existed.divisor = divisor;
        } else {
          this.inputLayoutDescriptor.vertexBufferDescriptors[
            bufferIndex
          ].attributes.push({
            format,
            offset: bufferByteOffset,
            shaderLocation: location,
            divisor,
          });
        }
      },
    );

    // create GPUBuffer
    if (this.vertexBuffers[bufferIndex]) {
      this.vertexBuffers[bufferIndex].destroy();
    }

    const buffer = makeDataBuffer(
      this.device,
      BufferUsage.VERTEX,
      data.buffer,
      BufferFrequencyHint.DYNAMIC,
    );
    this.vertexBuffers[bufferIndex] = buffer;

    return this;
  }

  getVertexBuffer(bufferIndex: number) {
    return this.vertexBuffers[bufferIndex];
  }

  updateVertexBuffer(
    bufferIndex: number,
    location: number,
    index: number,
    data: Uint8Array,
  ) {
    const bufferDescriptor =
      this.inputLayoutDescriptor.vertexBufferDescriptors[bufferIndex];
    if (!bufferDescriptor) {
      return;
    }
    const { arrayStride } = bufferDescriptor;

    const descriptor = this.inputLayoutDescriptor.vertexBufferDescriptors[
      bufferIndex
    ].attributes.find((d) => d.shaderLocation === location);

    if (descriptor) {
      const vertexBuffer = this.getVertexBuffer(bufferIndex);
      const offset = index * arrayStride;
      vertexBuffer.setSubData(descriptor.offset + offset, data);

      // TODO: update vertices
      // this.vertices[bufferIndex] = data;
    }

    this.emit(GeometryEvent.CHANGED);
  }

  updateIndices(indices: IndicesArray, offset = 0) {
    if (this.indexBuffer) {
      this.indexBuffer.setSubData(
        offset,
        new Uint8Array(
          ArrayBuffer.isView(indices) ? indices : new Uint32Array(indices),
        ),
      );
    }
    return this;
  }

  destroy() {
    this.vertexBuffers.forEach((buffer) => {
      if (buffer) {
        buffer.destroy();
      }
    });

    if (this.indexBuffer) {
      this.indexBuffer.destroy();
    }

    this.inputLayoutDescriptor.vertexBufferDescriptors = [];

    this.indexBuffer = undefined;
    this.vertexBuffers = [];
    this.indices = undefined;
    this.vertices = [];
    this.vertexCount = 0;
    this.instancedCount = 0;
  }
}
