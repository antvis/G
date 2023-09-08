import {
  Format,
  Texture,
  TextureDescriptor,
  TextureDimension,
} from '@antv/g-plugin-device-renderer';
import { ResourceType } from '@antv/g-plugin-device-renderer';
import type { IDevice_WebGPU, TextureShared_WebGPU } from './interfaces';
import { ResourceBase_WebGPU } from './ResourceBase';

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
    sampleCount,
  }: {
    id: number;
    device: IDevice_WebGPU;
    descriptor: TextureDescriptor;
    skipCreate?: boolean;
    sampleCount?: number;
  }) {
    super({ id, device });

    this.device.createTextureShared(
      {
        pixelFormat: descriptor.pixelFormat,
        dimension: descriptor.dimension ?? TextureDimension.TEXTURE_2D,
        width: descriptor.width,
        height: descriptor.height,
        depthOrArrayLayers: descriptor.depth,
        numLevels: descriptor.numLevels ?? 1,
        usage: descriptor.usage,
        sampleCount: sampleCount ?? 1,
      },
      this,
      skipCreate,
    );
  }

  private textureFromImageBitmapOrCanvas(
    device: GPUDevice,
    source: ImageBitmap | HTMLCanvasElement | OffscreenCanvas,
  ) {
    const textureDescriptor: GPUTextureDescriptor = {
      // Unlike in WebGL, the size of our texture must be set at texture creation time.
      // This means we have to wait until the image is loaded to create the texture, since we won't
      // know the size until then.
      size: { width: source.width, height: source.height },
      format: 'rgba8unorm',
      usage:
        GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.COPY_DST |
        GPUTextureUsage.RENDER_ATTACHMENT,
    };
    const texture = device.createTexture(textureDescriptor);

    device.queue.copyExternalImageToTexture(
      { source },
      { texture },
      textureDescriptor.size,
    );

    return texture;
  }

  /**
   * @see https://toji.dev/webgpu-best-practices/img-textures
   */
  setImageData(data: TexImageSource | ArrayBufferView[], level: number) {
    const { device } = this.device;
    let texture: GPUTexture;
    if (data instanceof HTMLVideoElement) {
      // @see https://toji.dev/webgpu-best-practices/img-textures#creating-a-texture-from-an-htmlvideoelement-video-tag
      texture = device.importExternalTexture({
        source: data,
      }) as unknown as GPUTexture;
      this.width = data.width;
      this.height = data.height;
    } else if (
      data instanceof ImageBitmap ||
      data instanceof HTMLCanvasElement ||
      data instanceof OffscreenCanvas
    ) {
      texture = this.textureFromImageBitmapOrCanvas(device, data);
      this.width = data.width;
      this.height = data.height;
    } else if (Array.isArray(data)) {
      // TODO: support ArrayBufferView[]
    }

    this.gpuTexture = texture;
    this.gpuTextureView = texture.createView();
  }

  destroy() {
    super.destroy();
    // @see https://www.w3.org/TR/webgpu/#dom-gputexture-destroy
    this.gpuTexture.destroy();
  }
}
