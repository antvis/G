import type {
  Format,
  Texture,
  TextureDescriptor,
  TextureDimension,
} from '@antv/g-plugin-device-renderer';
import { ResourceType } from '@antv/g-plugin-device-renderer';
import type { IDevice_WebGPU, TextureShared_WebGPU } from './interfaces';
import { ResourceBase_WebGPU } from './ResourceBase';

// @see https://toji.dev/webgpu-best-practices/img-textures

export class Texture_WebGPU
  extends ResourceBase_WebGPU
  implements TextureShared_WebGPU, Texture
{
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

  setImageData(data: TexImageSource | ArrayBufferView[], level: number) {
    // @see https://www.w3.org/TR/webgpu/#image-copies
    // @see https://www.w3.org/TR/webgpu/#dom-gpuqueue-copyexternalimagetotexture

    const isArray = Array.isArray(data);
    if (!isArray) {
      // if (this.gpuTexture) {
      //   this.gpuTexture.destroy();
      // }

      const textureDescriptor: GPUTextureDescriptor = {
        // Unlike in WebGL, the size of our texture must be set at texture creation time.
        // This means we have to wait until the image is loaded to create the texture, since we won't
        // know the size until then.
        size: { width: data.width, height: data.height },
        format: 'rgba8unorm',
        usage:
          GPUTextureUsage.TEXTURE_BINDING |
          GPUTextureUsage.COPY_DST |
          GPUTextureUsage.RENDER_ATTACHMENT,
      };
      const texture = this.device.device.createTexture(textureDescriptor);
      this.gpuTexture = texture;
      this.gpuTextureView = texture.createView();
      this.width = data.width;
      this.height = data.height;

      this.device.device.queue.copyExternalImageToTexture(
        { source: data },
        { texture },
        textureDescriptor.size,
      );
    } else {
      // TODO: support ArrayBufferView[]
    }
  }

  destroy() {
    // @see https://www.w3.org/TR/webgpu/#dom-gputexture-destroy
    this.gpuTexture.destroy();
  }
}
