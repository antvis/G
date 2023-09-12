import type {
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

  gpuBindGroup: GPUBindGroup[];
  bindGroupLayout: BindGroupLayout;
  numUniformBuffers: number;

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

    const { pipeline } = descriptor;
    assert(!!pipeline);

    const { uniformBufferBindings, storageBufferBindings, samplerBindings } =
      descriptor;
    this.numUniformBuffers = uniformBufferBindings?.length || 0;

    // entries orders: Storage(read-only storage) Uniform Sampler
    const gpuBindGroupEntries: GPUBindGroupEntry[][] = [[], []];
    let numBindings = 0;

    if (storageBufferBindings && storageBufferBindings.length) {
      for (let i = 0; i < storageBufferBindings.length; i++) {
        const { binding, size, offset, buffer } =
          descriptor.storageBufferBindings[i];
        assert(size > 0);
        const gpuBufferBinding: GPUBufferBinding = {
          buffer: getPlatformBuffer(buffer),
          offset: offset ?? 0,
          size: size,
        };
        gpuBindGroupEntries[0].push({
          binding: binding ?? numBindings++,
          resource: gpuBufferBinding,
        });
      }
    }

    if (uniformBufferBindings && uniformBufferBindings.length) {
      for (let i = 0; i < uniformBufferBindings.length; i++) {
        const { binding, size, offset, buffer } =
          descriptor.uniformBufferBindings[i];
        assert(size > 0);
        const gpuBufferBinding: GPUBufferBinding = {
          buffer: getPlatformBuffer(buffer),
          offset: offset ?? 0,
          size: size,
        };
        gpuBindGroupEntries[0].push({
          binding: binding ?? numBindings++,
          resource: gpuBufferBinding,
        });
      }
    }

    if (samplerBindings && samplerBindings.length) {
      numBindings = 0;
      for (let i = 0; i < samplerBindings.length; i++) {
        const samplerEntry = {
          ...defaultBindingLayoutSamplerDescriptor,
          ...samplerBindings[i],
        };

        const binding = descriptor.samplerBindings[i];
        const texture =
          binding.texture !== null
            ? binding.texture
            : this.device['getFallbackTexture'](samplerEntry);
        assert(
          samplerEntry.dimension === (texture as Texture_WebGPU).dimension,
        );
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
  }
}
