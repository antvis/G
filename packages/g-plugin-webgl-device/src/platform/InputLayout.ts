import { Format, ResourceType, assert } from '@antv/g-plugin-device-renderer';
import type {
  InputLayout,
  InputLayoutBufferDescriptor,
  InputLayoutDescriptor,
  VertexAttributeDescriptor,
} from '@antv/g-plugin-device-renderer';
import type { Device_GL } from './Device';
import { ResourceBase_GL } from './ResourceBase';

export class InputLayout_GL extends ResourceBase_GL implements InputLayout {
  type: ResourceType.InputLayout = ResourceType.InputLayout;

  vertexAttributeDescriptors: VertexAttributeDescriptor[];
  vertexBufferDescriptors: (InputLayoutBufferDescriptor | null)[];
  indexBufferFormat: Format | null;

  constructor({
    id,
    device,
    descriptor,
  }: {
    id: number;
    device: Device_GL;
    descriptor: InputLayoutDescriptor;
  }) {
    super({ id, device });

    const { vertexAttributeDescriptors, vertexBufferDescriptors, indexBufferFormat } = descriptor;
    assert(
      indexBufferFormat === Format.U16_R ||
        indexBufferFormat === Format.U32_R ||
        indexBufferFormat === null,
    );

    this.vertexAttributeDescriptors = vertexAttributeDescriptors;
    this.vertexBufferDescriptors = vertexBufferDescriptors;
    this.indexBufferFormat = indexBufferFormat;
  }
}
