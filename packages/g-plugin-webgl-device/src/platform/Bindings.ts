import type {
  Bindings,
  BindingsDescriptor,
  BufferBinding,
  SamplerBinding,
} from '@antv/g-plugin-device-renderer';
import {
  ResourceType,
  assert,
  defaultBindingLayoutSamplerDescriptor,
} from '@antv/g-plugin-device-renderer';
import type { Device_GL } from './Device';
import { ResourceBase_GL } from './ResourceBase';
import type { BindingLayoutSamplerDescriptor_GL } from './interfaces';
import { translateTextureDimension } from './utils';

export interface BindingLayoutTable_GL {
  firstUniformBuffer: number;
  numUniformBuffers: number;
  firstSampler: number;
  numSamplers: number;
  samplerEntries: BindingLayoutSamplerDescriptor_GL[];
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

    const { uniformBufferBindings } = descriptor;
    for (let i = 0; i < uniformBufferBindings?.length; i++) {
      assert(uniformBufferBindings[i].size > 0);
    }

    this.uniformBufferBindings = descriptor.uniformBufferBindings;
    this.samplerBindings = descriptor.samplerBindings;

    this.bindingLayouts = this.createBindingLayouts();
  }

  private createBindingLayouts(): BindingLayouts_GL {
    let firstUniformBuffer = 0;
    let firstSampler = 0;
    const bindingLayoutTables: BindingLayoutTable_GL[] = [];

    // Support only 1 bindGroup for now.
    // for (let i = 0; i < bindingLayouts.length; i++) {
    // const { numUniformBuffers, numSamplers, samplerEntries } =
    //   bindingLayouts[i];

    const numUniformBuffers = this.uniformBufferBindings.length;
    const numSamplers = this.samplerBindings.length;

    const bindingSamplerEntries: BindingLayoutSamplerDescriptor_GL[] = [];

    for (let j = 0; j < numSamplers; j++) {
      const samplerEntry = {
        ...defaultBindingLayoutSamplerDescriptor,
        ...this.samplerBindings[j],
      };
      const { dimension, formatKind } = samplerEntry;
      bindingSamplerEntries.push({
        gl_target: translateTextureDimension(dimension),
        formatKind,
      });
    }

    bindingLayoutTables.push({
      firstUniformBuffer,
      numUniformBuffers,
      firstSampler,
      numSamplers,
      samplerEntries: bindingSamplerEntries,
    });
    firstUniformBuffer += numUniformBuffers;
    firstSampler += numSamplers;
    // }
    return {
      numUniformBuffers: firstUniformBuffer,
      numSamplers: firstSampler,
      bindingLayoutTables,
    };
  }
}
