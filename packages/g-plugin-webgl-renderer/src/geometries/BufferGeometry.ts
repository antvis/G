import { AABB } from '@antv/g';
import { ElementEvent, MutationEvent } from '@antv/g';
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
import { align } from '../platform/utils';

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

export type IndicesArray = number[] | Int32Array | Uint32Array | Uint16Array;

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

export enum VertexAttributeLocation {
  // TODO: bind mat4 in WebGL2 instead of decomposed 4 * vec4?
  // @see https://stackoverflow.com/questions/38853096/webgl-how-to-bind-values-to-a-mat4-attribute/38853623#38853623
  MODEL_MATRIX0,
  MODEL_MATRIX1,
  MODEL_MATRIX2,
  MODEL_MATRIX3,
  COLOR,
  STROKE_COLOR,
  PACKED_STYLE1, // opacity fillOpacity strokeOpacity lineWidth
  PACKED_STYLE2, // visibility
  PICKING_COLOR,
  ANCHOR,
  MAX,
}

/**
 * just hold descriptors of buffers & indices, won't use underlying GPU resources
 */
export class BufferGeometry<GeometryProps = any> extends EventEmitter {
  /**
   * 绘制模式
   */
  drawMode: PrimitiveTopology = PrimitiveTopology.Triangles;

  /**
   * 存放 Attribute Buffer 列表
   */
  vertexBuffers: Buffer[] = [];

  vertices: ArrayBufferView[] = [];

  /**
   * 存放 Index Buffer
   */
  indexBuffer: Buffer;

  /**
   * 索引数组
   */
  indices: IndicesArray;

  inputLayoutDescriptor: InputLayoutDescriptor = {
    vertexBufferDescriptors: [],
    vertexAttributeDescriptors: [],
    indexBufferFormat: Format.U32_R,
  };

  vertexCount: number = 0;

  instancedCount: number = 0;

  indexStart: number = 0;

  primitiveStart: number = 0;

  dirty = true;

  meshes: Mesh[] = [];

  constructor(public device: Device, public props: Partial<GeometryProps> = {}) {
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

    this.indexBuffer = makeStaticDataBuffer(
      this.device,
      BufferUsage.INDEX,
      new Uint32Array(ArrayBuffer.isView(indices) ? indices.buffer : indices).buffer,
    );

    this.indices = indices;

    return this;
  }

  setVertexBuffer(descriptor: GeometryVertexBufferDescriptor) {
    const { bufferIndex, byteStride, frequency, attributes, data } = descriptor;

    this.inputLayoutDescriptor.vertexBufferDescriptors[bufferIndex] = {
      byteStride,
      frequency,
    };

    this.vertices[bufferIndex] = data;

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

  updateVertexBuffer(bufferIndex: number, location: number, index: number, data: Uint8Array) {
    const { byteStride } = this.inputLayoutDescriptor.vertexBufferDescriptors[bufferIndex];

    const descriptor = this.inputLayoutDescriptor.vertexAttributeDescriptors.find(
      (d) => d.location === location,
    );

    if (descriptor) {
      const vertexBuffer = this.getVertexBuffer(bufferIndex);
      const offset = index * byteStride;
      vertexBuffer.setSubData(descriptor.bufferByteOffset + offset, data);

      // TODO: update vertices
      // this.vertices[bufferIndex] = data;
    }

    // trigger re-render
    this.meshes.forEach((mesh) => {
      // mesh.emit(ElementEvent.ATTR_MODIFIED, {
      //   attributeName: 'geometry',
      // });
      mesh.dispatchEvent(
        new MutationEvent(
          ElementEvent.ATTR_MODIFIED,
          mesh,
          null,
          null,
          'geometry',
          MutationEvent.MODIFICATION,
          null,
          null,
        ),
      );
    });
  }

  updateIndices(indices: IndicesArray, offset: number = 0) {
    if (this.indexBuffer) {
      this.indexBuffer.setSubData(
        offset,
        ArrayBuffer.isView(indices) ? indices : new Uint32Array(indices),
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

    this.inputLayoutDescriptor.vertexAttributeDescriptors = [];
    this.inputLayoutDescriptor.vertexBufferDescriptors = [];

    this.indexBuffer = undefined;
    this.vertexBuffers = [];
    this.indices = undefined;
    this.vertices = [];
    this.vertexCount = 0;
    this.instancedCount = 0;
  }
}
