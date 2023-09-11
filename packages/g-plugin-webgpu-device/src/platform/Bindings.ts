import type {
  BindingLayoutDescriptor,
  Bindings,
  BindingsDescriptor,
} from '@antv/g-plugin-device-renderer';
import {
  getFormatSamplerKind,
  ResourceType,
  assert,
  defaultBindingLayoutSamplerDescriptor,
} from '@antv/g-plugin-device-renderer';
import { getPlatformBuffer, getPlatformSampler } from './utils';
import type { BindGroupLayout, IDevice_WebGPU } from './interfaces';
import { ResourceBase_WebGPU } from './ResourceBase';
import type { Texture_WebGPU } from './Texture';
import { ComputePipeline_WebGPU } from './ComputePipeline';

export class Bindings_WebGPU extends ResourceBase_WebGPU implements Bindings {
  type: ResourceType.Bindings = ResourceType.Bindings;

  bindingLayout: BindingLayoutDescriptor;
  gpuBindGroup: GPUBindGroup[];
  bindGroupLayout: BindGroupLayout;

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

    const bindGroupLayout = this.device['createBindGroupLayout'](bindingLayout);

    // entries orders: Storage(read-only storage) Uniform Sampler
    const gpuBindGroupEntries: GPUBindGroupEntry[][] = [[], []];
    let numBindings = 0;

    if (bindingLayout.storageEntries) {
      for (let i = 0; i < bindingLayout.storageEntries.length; i++) {
        const binding = descriptor.storageBufferBindings[i];
        assert(binding.wordCount > 0);
        const gpuBufferBinding: GPUBufferBinding = {
          buffer: getPlatformBuffer(binding.buffer),
          offset: 0,
          size: binding.wordCount << 2,
        };
        gpuBindGroupEntries[0].push({
          binding: numBindings++,
          resource: gpuBufferBinding,
        });
      }
    }

    for (let i = 0; i < bindingLayout.numUniformBuffers; i++) {
      const binding = descriptor.uniformBufferBindings[i];
      assert(binding.wordCount > 0);
      const gpuBufferBinding: GPUBufferBinding = {
        buffer: getPlatformBuffer(binding.buffer),
        offset: 0,
        size: binding.wordCount << 2,
      };
      gpuBindGroupEntries[0].push({
        binding: numBindings++,
        resource: gpuBufferBinding,
      });
    }

    numBindings = 0;
    for (let i = 0; i < bindingLayout.numSamplers; i++) {
      const samplerEntry =
        bindingLayout.samplerEntries !== undefined
          ? bindingLayout.samplerEntries[i]
          : defaultBindingLayoutSamplerDescriptor;

      const binding = descriptor.samplerBindings[i];
      const texture =
        binding.texture !== null
          ? binding.texture
          : this.device['getFallbackTexture'](samplerEntry);
      assert(samplerEntry.dimension === (texture as Texture_WebGPU).dimension);
      assert(
        samplerEntry.formatKind ===
          getFormatSamplerKind((texture as Texture_WebGPU).pixelFormat),
      );
      const gpuTextureView = (texture as Texture_WebGPU).gpuTextureView;
      gpuBindGroupEntries[1].push({
        binding: numBindings++,
        resource: gpuTextureView,
      });

      const sampler =
        binding.sampler !== null
          ? binding.sampler
          : this.device['getFallbackSampler'](samplerEntry);
      const gpuSampler = getPlatformSampler(sampler);
      gpuBindGroupEntries[1].push({
        binding: numBindings++,
        resource: gpuSampler,
      });
    }

    this.gpuBindGroup = gpuBindGroupEntries
      .filter((entries) => entries.length > 0)
      .map((gpuBindGroupEntries, i) =>
        this.device.device.createBindGroup({
          // layout: bindGroupLayout.gpuBindGroupLayout[i],
          layout: (pipeline as ComputePipeline_WebGPU).getBindGroupLayout(i),
          entries: gpuBindGroupEntries,
        }),
      );
    this.bindingLayout = descriptor.bindingLayout;
    this.bindGroupLayout = bindGroupLayout;
  }
}
