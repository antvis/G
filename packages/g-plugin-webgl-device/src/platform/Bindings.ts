import type {
  Bindings,
  BindingsDescriptor,
  BufferBinding,
  SamplerBinding,
} from '@antv/g-plugin-device-renderer';
import { ResourceType, assert } from '@antv/g-plugin-device-renderer';
import type { Device_GL } from './Device';
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

    const { bindingLayout, uniformBufferBindings, samplerBindings } = descriptor;
    assert(uniformBufferBindings.length >= bindingLayout.numUniformBuffers);
    assert(samplerBindings.length >= bindingLayout.numSamplers);
    for (let i = 0; i < bindingLayout.numUniformBuffers; i++) {
      assert(uniformBufferBindings[i].wordCount > 0);
    }

    this.uniformBufferBindings = descriptor.uniformBufferBindings;
    this.samplerBindings = descriptor.samplerBindings;
  }
}
