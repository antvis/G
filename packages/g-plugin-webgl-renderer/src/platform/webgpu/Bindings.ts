import { BindingLayoutDescriptor, Bindings, BindingsDescriptor, ResourceType } from '../interfaces';
import { assert } from '../utils';
import { getPlatformBuffer, getPlatformSampler } from './utils';
import { IDevice_WebGPU } from './interfaces';
import { BindGroupLayout } from './interfaces';
import { ResourceBase_WebGPU } from './ResourceBase';
import { Texture_WebGPU } from './Texture';
import { RenderPipeline_WebGPU } from './RenderPipeline';

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

    // entries orders: Storage(read-only storage) Uniform Sampler
    const gpuBindGroupEntries: GPUBindGroupEntry[][] = [[], []];
    let numBindings = 0;
    for (let i = 0; i < bindingLayout.numUniformBuffers; i++) {
      const gfxBinding = descriptor.uniformBufferBindings[i];
      // assert(gfxBinding.wordCount > 0);
      const gpuBufferBinding: GPUBufferBinding = {
        buffer: getPlatformBuffer(gfxBinding.buffer),
        // offset: 0,
        // size: gfxBinding.wordCount << 2,
      };
      gpuBindGroupEntries[0].push({ binding: numBindings++, resource: gpuBufferBinding });
    }

    numBindings = 0;
    for (let i = 0; i < bindingLayout.numSamplers; i++) {
      const gfxBinding = descriptor.samplerBindings[i];
      const texture =
        gfxBinding.texture !== null ? gfxBinding.texture : this.device.fallbackTexture;
      const gpuTextureView = (texture as Texture_WebGPU).gpuTextureView;
      gpuBindGroupEntries[1].push({ binding: numBindings++, resource: gpuTextureView });

      const sampler =
        gfxBinding.sampler !== null ? gfxBinding.sampler : this.device.fallbackSampler;
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
