import {
  Format,
  Texture,
  TextureDescriptor,
  TextureDimension,
} from '@antv/g-plugin-device-renderer';
import { ResourceType } from '@antv/g-plugin-device-renderer';
import type { IDevice_WebGPU, TextureShared_WebGPU } from './interfaces';
import { ResourceBase_WebGPU } from './ResourceBase';
import { translateTextureViewDimension } from './utils';

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
        depthOrArrayLayers: descriptor.depth ?? 1,
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
    sources: (ImageBitmap | HTMLCanvasElement | OffscreenCanvas)[],
    depthOrArrayLayers: number,
  ): [GPUTexture, number, number] {
    const width = sources[0].width;
    const height = sources[0].height;
    const textureDescriptor: GPUTextureDescriptor = {
      // Unlike in WebGL, the size of our texture must be set at texture creation time.
      // This means we have to wait until the image is loaded to create the texture, since we won't
      // know the size until then.
      size: { width, height, depthOrArrayLayers },
      format: 'rgba8unorm',
      usage:
        GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.COPY_DST |
        GPUTextureUsage.RENDER_ATTACHMENT,
    };
    const texture = device.createTexture(textureDescriptor);

    for (let i = 0; i < sources.length; i++) {
      device.queue.copyExternalImageToTexture(
        { source: sources[i] },
        { texture, origin: [0, 0, i] },
        [width, height],
      );
    }

    return [texture, width, height];
  }

  private isImageBitmapOrCanvases(
    datas: (TexImageSource | ArrayBufferView)[],
  ): datas is (ImageBitmap | HTMLCanvasElement | OffscreenCanvas)[] {
    const data = datas[0];
    return (
      data instanceof ImageBitmap ||
      data instanceof HTMLCanvasElement ||
      data instanceof OffscreenCanvas
    );
  }

  private isVideo(
    datas: (TexImageSource | ArrayBufferView)[],
  ): datas is HTMLVideoElement[] {
    const data = datas[0];
    return data instanceof HTMLVideoElement;
  }

  /**
   * @see https://toji.dev/webgpu-best-practices/img-textures
   */
  setImageData(datas: (TexImageSource | ArrayBufferView)[], lod = 0) {
    const { device } = this.device;
    let texture: GPUTexture;
    let width: number;
    let height: number;

    if (this.isImageBitmapOrCanvases(datas)) {
      [texture, width, height] = this.textureFromImageBitmapOrCanvas(
        device,
        datas,
        this.depthOrArrayLayers,
      );
    } else if (this.isVideo(datas)) {
      // @see https://toji.dev/webgpu-best-practices/img-textures#creating-a-texture-from-an-htmlvideoelement-video-tag
      texture = device.importExternalTexture({
        source: datas[0],
      }) as unknown as GPUTexture;
    } else {
      // TODO: support ArrayBufferView[]
    }

    this.width = width;
    this.height = height;
    this.gpuTexture = texture;
    this.gpuTextureView = texture.createView({
      dimension: translateTextureViewDimension(this.dimension),
    });
  }

  destroy() {
    super.destroy();
    // @see https://www.w3.org/TR/webgpu/#dom-gputexture-destroy
    this.gpuTexture.destroy();
  }
}
