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
import { getPlatformBuffer, getPlatformSampler } from './utils';
import { IDevice_WebGPU } from './interfaces';
import { BindGroupLayout } from './interfaces';
import { ResourceBase_WebGPU } from './ResourceBase';
import { Texture_WebGPU } from './Texture';
import { RenderPipeline_WebGPU } from './RenderPipeline';
import { getFormatSamplerKind } from '../format';

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
        layout: (pipeline as RenderPipeline_WebGPU).getBindGroupLayout(i),
        entries: gpuBindGroupEntry,
      }),
    );
    this.bindingLayout = descriptor.bindingLayout;
  }
}
