import type {
  Format,
  Texture,
  TextureDescriptor,
  TextureDimension,
} from '@antv/g-plugin-device-renderer';
import { ResourceType } from '@antv/g-plugin-device-renderer';
import type { IDevice_WebGPU } from './interfaces';
import type { TextureShared_WebGPU } from './interfaces';
import { ResourceBase_WebGPU } from './ResourceBase';

// @see https://toji.github.io/webgpu-best-practices/img-textures.html

export class Texture_WebGPU extends ResourceBase_WebGPU implements TextureShared_WebGPU, Texture {
  type: ResourceType.Texture = ResourceType.Texture;
  pixelFormat: Format;
  dimension: TextureDimension;
  format: GPUTextureFormat;
  width: number;
  height: number;
  depthOrArrayLayers: number;
  numLevels: number;
  sampleCount: number;
  usage: GPUTextureUsageFlags;
  gpuTexture: GPUTexture;
  gpuTextureView: GPUTextureView;

  constructor({
    id,
    device,
    descriptor,
    skipCreate,
  }: {
    id: number;
    device: IDevice_WebGPU;
    descriptor: TextureDescriptor;
    skipCreate?: boolean;
  }) {
    super({ id, device });

    this.device.createTextureShared(
      {
        pixelFormat: descriptor.pixelFormat,
        dimension: descriptor.dimension,
        width: descriptor.width,
        height: descriptor.height,
        depthOrArrayLayers: descriptor.depth,
        numLevels: descriptor.numLevels,
        usage: descriptor.usage,
        sampleCount: 1,
      },
      this,
      skipCreate,
    );
  }

  setImageData(data: TexImageSource, level: number) {
    // TODO: https://www.w3.org/TR/webgpu/#image-copies
  }

  destroy() {
    // @see https://www.w3.org/TR/webgpu/#dom-gputexture-destroy
    this.gpuTexture.destroy();
  }
}
