import type { Device, Format, Texture } from '@antv/g-device-api';
import { assert, TextureDimension, TextureUsage } from '@antv/g-device-api';
import type { RGRenderTargetDescription } from './RenderTargetDescription';

// Whenever we need to resolve a multi-sampled render target to a single-sampled texture,
// we record an extra single-sampled texture here.
export class SingleSampledTexture {
  readonly dimension = TextureDimension.TEXTURE_2D;
  readonly depthOrArrayLayers = 1;
  readonly mipLevelCount = 1;

  readonly usage = TextureUsage.RENDER_TARGET;

  format: Format;
  width = 0;
  height = 0;

  texture: Texture;
  age = 0;

  constructor(device: Device, desc: Readonly<RGRenderTargetDescription>) {
    this.format = desc.format;
    this.width = desc.width;
    this.height = desc.height;

    this.texture = device.createTexture(this);
  }

  matchesDescription(desc: Readonly<RGRenderTargetDescription>): boolean {
    return (
      this.format === desc.format &&
      this.width === desc.width &&
      this.height === desc.height
    );
  }

  reset(desc: Readonly<RGRenderTargetDescription>): void {
    assert(this.matchesDescription(desc));
    this.age = 0;
  }

  destroy(): void {
    this.texture.destroy();
  }
}
