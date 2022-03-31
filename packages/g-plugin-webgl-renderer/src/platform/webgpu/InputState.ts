import type {
  IndexBufferDescriptor,
  InputLayout,
  InputState,
  VertexBufferDescriptor} from '../interfaces';
import {
  ResourceType
} from '../interfaces';
import type { IDevice_WebGPU } from './interfaces';
import { ResourceBase_WebGPU } from './ResourceBase';

export class InputState_WebGPU extends ResourceBase_WebGPU implements InputState {
  type: ResourceType.InputState = ResourceType.InputState;

  inputLayout: InputLayout;
  vertexBuffers: (VertexBufferDescriptor | null)[];
  indexBuffer: IndexBufferDescriptor | null;

  constructor({
    id,
    device,
    inputLayout,
    vertexBuffers,
    indexBuffer,
  }: {
    id: number;
    device: IDevice_WebGPU;
    inputLayout: InputLayout;
    vertexBuffers: (VertexBufferDescriptor | null)[];
    indexBuffer: IndexBufferDescriptor | null;
  }) {
    super({ id, device });

    this.inputLayout = inputLayout;
    this.vertexBuffers = vertexBuffers;
    this.indexBuffer = indexBuffer;
  }
}
