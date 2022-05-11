import type { Sampler, SamplerDescriptor } from '@antv/g-plugin-device-renderer';
import { MipFilterMode, ResourceType, TexFilterMode, assert } from '@antv/g-plugin-device-renderer';
import { translateMinMagFilter, translateMipFilter, translateWrapMode } from './utils';
import type { IDevice_WebGPU } from './interfaces';
import { ResourceBase_WebGPU } from './ResourceBase';

export class Sampler_WebGPU extends ResourceBase_WebGPU implements Sampler {
  type: ResourceType.Sampler = ResourceType.Sampler;

  // @see https://www.w3.org/TR/webgpu/#gpusampler
  gpuSampler: GPUSampler;

  constructor({
    id,
    device,
    descriptor,
  }: {
    id: number;
    device: IDevice_WebGPU;
    descriptor: SamplerDescriptor;
  }) {
    super({ id, device });

    const lodMinClamp = descriptor.minLOD;
    const lodMaxClamp =
      descriptor.mipFilter === MipFilterMode.NoMip ? descriptor.minLOD : descriptor.maxLOD;

    const maxAnisotropy = descriptor.maxAnisotropy ?? 1;
    if (maxAnisotropy > 1)
      assert(
        descriptor.minFilter === TexFilterMode.Bilinear &&
          descriptor.magFilter === TexFilterMode.Bilinear &&
          descriptor.mipFilter === MipFilterMode.Linear,
      );

    this.gpuSampler = this.device.device.createSampler({
      addressModeU: translateWrapMode(descriptor.wrapS),
      addressModeV: translateWrapMode(descriptor.wrapT),
      addressModeW: translateWrapMode(descriptor.wrapQ ?? descriptor.wrapS),
      lodMinClamp,
      lodMaxClamp,
      minFilter: translateMinMagFilter(descriptor.minFilter),
      magFilter: translateMinMagFilter(descriptor.magFilter),
      mipmapFilter: translateMipFilter(descriptor.mipFilter),
      maxAnisotropy,
    });
  }
}
