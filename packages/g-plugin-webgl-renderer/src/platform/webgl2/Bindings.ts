import {
  Bindings,
  BindingsDescriptor,
  BufferBinding,
  ResourceType,
  SamplerBinding,
} from '../interfaces';
import { Device_GL } from './Device';
import { ResourceBase_GL } from './ResourceBase';

export class Bindings_GL extends ResourceBase_GL implements Bindings {
  type: ResourceType.Bindings = ResourceType.Bindings;

  uniformBufferBindings: BufferBinding[];
  samplerBindings: (SamplerBinding | null)[];

  constructor({
    id,
    device,
    descriptor,
  }: {
    id: number;
    device: Device_GL;
    descriptor: BindingsDescriptor;
  }) {
    super({ id, device });

    this.uniformBufferBindings = descriptor.uniformBufferBindings;
    this.samplerBindings = descriptor.samplerBindings;
  }
}
