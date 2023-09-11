import type {
  InputLayout,
  InputLayoutDescriptor,
} from '@antv/g-plugin-device-renderer';
import { assertExists, ResourceType } from '@antv/g-plugin-device-renderer';
import type { IDevice_WebGPU } from './interfaces';
import { ResourceBase_WebGPU } from './ResourceBase';
import {
  translateIndexFormat,
  translateVertexStepMode,
  translateVertexFormat,
} from './utils';

export class InputLayout_WebGPU
  extends ResourceBase_WebGPU
  implements InputLayout
{
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
    for (let i = 0; i < descriptor.vertexAttributeDescriptors.length; i++) {
      const attr = descriptor.vertexAttributeDescriptors[i];

      const attribute: GPUVertexAttribute = {
        shaderLocation: attr.location,
        format: translateVertexFormat(attr.format),
        offset: attr.bufferByteOffset,
      };

      if (buffers[attr.bufferIndex] !== undefined) {
        (buffers[attr.bufferIndex].attributes as GPUVertexAttribute[]).push(
          attribute,
        );
      } else {
        const b = assertExists(
          descriptor.vertexBufferDescriptors[attr.bufferIndex],
        );
        const arrayStride = b.byteStride;
        const stepMode = translateVertexStepMode(b.stepMode);
        const attributes: GPUVertexAttribute[] = [attribute];
        buffers[attr.bufferIndex] = { arrayStride, stepMode, attributes };
      }
    }

    this.indexFormat = translateIndexFormat(descriptor.indexBufferFormat);
    this.buffers = buffers;
  }
}
