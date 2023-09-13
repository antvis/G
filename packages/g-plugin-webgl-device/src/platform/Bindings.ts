import type {
  Bindings,
  BindingsDescriptor,
  BufferBinding,
  SamplerBinding,
} from '@antv/g-plugin-device-renderer';
import { ResourceType } from '@antv/g-plugin-device-renderer';
import type { Device_GL } from './Device';
import { ResourceBase_GL } from './ResourceBase';

export interface BindingLayoutTable_GL {
  firstUniformBuffer: number;
  numUniformBuffers: number;
  firstSampler: number;
  numSamplers: number;
}

export interface BindingLayouts_GL {
  numSamplers: number;
  numUniformBuffers: number;
  bindingLayoutTables: BindingLayoutTable_GL[];
}

export class Bindings_GL extends ResourceBase_GL implements Bindings {
  type: ResourceType.Bindings = ResourceType.Bindings;

  uniformBufferBindings: BufferBinding[];
  samplerBindings: (SamplerBinding | null)[];
  bindingLayouts: BindingLayouts_GL;

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

    const { uniformBufferBindings, samplerBindings } = descriptor;
    this.uniformBufferBindings = uniformBufferBindings || [];
    this.samplerBindings = samplerBindings || [];
    this.bindingLayouts = this.createBindingLayouts();
  }

  private createBindingLayouts(): BindingLayouts_GL {
    let firstUniformBuffer = 0;
    let firstSampler = 0;
    const bindingLayoutTables: BindingLayoutTable_GL[] = [];

    // Support only 1 bindGroup for now.
    const numUniformBuffers = this.uniformBufferBindings.length;
    const numSamplers = this.samplerBindings.length;

    bindingLayoutTables.push({
      firstUniformBuffer,
      numUniformBuffers,
      firstSampler,
      numSamplers,
    });
    firstUniformBuffer += numUniformBuffers;
    firstSampler += numSamplers;

    return {
      numUniformBuffers: firstUniformBuffer,
      numSamplers: firstSampler,
      bindingLayoutTables,
    };
  }
}
