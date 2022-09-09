import type { InputLayout, InputLayoutDescriptor } from '@antv/g-plugin-device-renderer';
import { assertExists, ResourceType } from '@antv/g-plugin-device-renderer';
import { isNil } from '@antv/util';
import type { IDevice_WebGPU } from './interfaces';
import { ResourceBase_WebGPU } from './ResourceBase';
import {
  translateIndexFormat,
  translateVertexBufferFrequency,
  translateVertexFormat,
} from './utils';

export class InputLayout_WebGPU extends ResourceBase_WebGPU implements InputLayout {
  type: ResourceType.InputLayout = ResourceType.InputLayout;

  buffers: GPUVertexBufferLayout[];
  indexFormat: GPUIndexFormat | undefined;

  constructor({
    id,
    device,
    descriptor,
  }: {
    id: number;
    device: IDevice_WebGPU;
    descriptor: InputLayoutDescriptor;
  }) {
    super({ id, device });

    const buffers: GPUVertexBufferLayout[] = [];
    for (let i = 0; i < descriptor.vertexBufferDescriptors.length; i++) {
      const b = descriptor.vertexBufferDescriptors[i];
      if (isNil(b)) continue;
      const arrayStride = b.byteStride;
      const stepMode = translateVertexBufferFrequency(b.frequency);
      const attributes: GPUVertexAttribute[] = [];
      buffers[i] = { arrayStride, stepMode, attributes };
    }

    for (let i = 0; i < descriptor.vertexAttributeDescriptors.length; i++) {
      const attr = descriptor.vertexAttributeDescriptors[i];
      const b = assertExists(buffers[attr.bufferIndex]);
      const attribute: GPUVertexAttribute = {
        shaderLocation: attr.location,
        format: translateVertexFormat(attr.format),
        offset: attr.bufferByteOffset,
      };
      (b.attributes as GPUVertexAttribute[]).push(attribute);
    }

    this.indexFormat = translateIndexFormat(descriptor.indexBufferFormat);
    this.buffers = buffers;
  }
}
