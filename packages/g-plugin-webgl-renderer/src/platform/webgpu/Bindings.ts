import {
  BindingLayoutDescriptor,
  BindingLayoutSamplerDescriptor,
  Bindings,
  BindingsDescriptor,
  ResourceType,
  SamplerFormatKind,
  TextureDimension,
} from '../interfaces';
import { assert } from '../utils';
import { getPlatformBuffer, getPlatformSampler, translateBindGroupTextureBinding } from './utils';
import { IDevice_WebGPU } from './interfaces';
import { BindGroupLayout } from './interfaces';
import { ResourceBase_WebGPU } from './ResourceBase';
import { Texture_WebGPU } from './Texture';
import { RenderPipeline_WebGPU } from './RenderPipeline';
import { getFormatSamplerKind } from '../format';
import { Device_WebGPU } from './Device';

export const defaultBindingLayoutSamplerDescriptor: BindingLayoutSamplerDescriptor = {
  formatKind: SamplerFormatKind.Float,
  dimension: TextureDimension.n2D,
};

export class Bindings_WebGPU extends ResourceBase_WebGPU implements Bindings {
  type: ResourceType.Bindings = ResourceType.Bindings;

  bindingLayout: BindingLayoutDescriptor;
  gpuBindGroup: GPUBindGroup[];

  constructor({
    id,
    device,
    descriptor,
  }: {
    id: number;
    device: IDevice_WebGPU;
    descriptor: BindingsDescriptor;
  }) {
    super({ id, device });

    const { pipeline, bindingLayout } = descriptor;
    assert(!!pipeline);

    const bindGroupLayout = this._createBindGroupLayout(bindingLayout);

    // entries orders: Storage(read-only storage) Uniform Sampler
    const gpuBindGroupEntries: GPUBindGroupEntry[][] = [[], []];
    let numBindings = 0;
    for (let i = 0; i < bindingLayout.numUniformBuffers; i++) {
      const binding = descriptor.uniformBufferBindings[i];
      assert(binding.wordCount > 0);
      const gpuBufferBinding: GPUBufferBinding = {
        buffer: getPlatformBuffer(binding.buffer),
        offset: 0,
        size: binding.wordCount << 2,
      };
      gpuBindGroupEntries[0].push({ binding: numBindings++, resource: gpuBufferBinding });
    }

    numBindings = 0;
    for (let i = 0; i < bindingLayout.numSamplers; i++) {
      const samplerEntry =
        bindingLayout.samplerEntries !== undefined
          ? bindingLayout.samplerEntries[i]
          : defaultBindingLayoutSamplerDescriptor;

      const binding = descriptor.samplerBindings[i];
      const texture =
        binding.texture !== null ? binding.texture : this.device.getFallbackTexture(samplerEntry);
      assert(samplerEntry.dimension === (texture as Texture_WebGPU).dimension);
      assert(
        samplerEntry.formatKind === getFormatSamplerKind((texture as Texture_WebGPU).pixelFormat),
      );
      const gpuTextureView = (texture as Texture_WebGPU).gpuTextureView;
      gpuBindGroupEntries[1].push({ binding: numBindings++, resource: gpuTextureView });

      const sampler = binding.sampler !== null ? binding.sampler : this.device.fallbackSampler;
      const gpuSampler = getPlatformSampler(sampler);
      gpuBindGroupEntries[1].push({ binding: numBindings++, resource: gpuSampler });
    }

    this.gpuBindGroup = gpuBindGroupEntries.map((gpuBindGroupEntry, i) =>
      this.device.device.createBindGroup({
        layout: bindGroupLayout.gpuBindGroupLayout[i],
        entries: gpuBindGroupEntry,
      }),
    );

    // this.gpuBindGroup = gpuBindGroupEntries.map((gpuBindGroupEntry, i) =>
    //   this.device.device.createBindGroup({
    //     layout: (pipeline as RenderPipeline_WebGPU).getBindGroupLayout(i),
    //     entries: gpuBindGroupEntry,
    //   }),
    // );
    this.bindingLayout = descriptor.bindingLayout;
  }

  private _createBindGroupLayout(bindingLayout: BindingLayoutDescriptor): BindGroupLayout {
    let gpuBindGroupLayout = (this.device as Device_WebGPU).bindGroupLayoutCache.get(bindingLayout);
    if (gpuBindGroupLayout === null) {
      gpuBindGroupLayout = this._createBindGroupLayoutInternal(bindingLayout);
      (this.device as Device_WebGPU).bindGroupLayoutCache.add(bindingLayout, gpuBindGroupLayout);
    }
    return gpuBindGroupLayout;
  }

  private _createBindGroupLayoutInternal(bindingLayout: BindingLayoutDescriptor): BindGroupLayout {
    const entries: GPUBindGroupLayoutEntry[][] = [[], []];

    for (let i = 0; i < bindingLayout.numUniformBuffers; i++)
      entries[0].push({
        binding: entries[0].length,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        buffer: { type: 'uniform', hasDynamicOffset: true },
      });

    for (let i = 0; i < bindingLayout.numSamplers; i++) {
      const samplerEntry =
        bindingLayout.samplerEntries !== undefined
          ? bindingLayout.samplerEntries[i]
          : defaultBindingLayoutSamplerDescriptor;
      entries[1].push({
        binding: entries[1].length,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        texture: translateBindGroupTextureBinding(samplerEntry),
      });
      entries[1].push({
        binding: entries[1].length,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
        sampler: { type: 'filtering' },
      });
    }

    const gpuBindGroupLayout = entries.map((entries) =>
      this.device.device.createBindGroupLayout({ entries }),
    );
    return { gpuBindGroupLayout };
  }
}
