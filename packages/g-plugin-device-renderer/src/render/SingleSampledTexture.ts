import type { Device, Format, Texture } from '../platform';
import { TextureDimension, TextureUsage } from '../platform';
import type { RGRenderTargetDescription } from './RenderTargetDescription';
import { assert } from '../platform/utils';

// Whenever we need to resolve a multi-sampled render target to a single-sampled texture,
// we record an extra single-sampled texture here.
export class SingleSampledTexture {
  readonly dimension = TextureDimension.TEXTURE_2D;
  readonly depth = 1;
  readonly numLevels = 1;
  readonly usage = TextureUsage.RENDER_TARGET;

  pixelFormat: Format;
  width = 0;
  height = 0;

  texture: Texture;
  age = 0;
  immutable = true;

  constructor(device: Device, desc: Readonly<RGRenderTargetDescription>) {
    this.pixelFormat = desc.pixelFormat;
    this.width = desc.width;
    this.height = desc.height;

    this.texture = device.createTexture(this);
  }

  matchesDescription(desc: Readonly<RGRenderTargetDescription>): boolean {
    return (
      this.pixelFormat === desc.pixelFormat &&
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
