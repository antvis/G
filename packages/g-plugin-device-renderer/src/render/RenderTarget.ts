import type { Device, Format, RenderTarget, Texture } from '@antv/g-device-api';
import { assert, TextureDimension, TextureUsage } from '@antv/g-device-api';
import type { RGRenderTargetDescription } from './RenderTargetDescription';

export class RGRenderTarget {
  debugName: string;

  readonly dimension = TextureDimension.TEXTURE_2D;
  readonly depthOrArrayLayers = 1;
  readonly mipLevelCount = 1;

  format: Format;
  width = 0;
  height = 0;
  sampleCount = 0;
  usage: TextureUsage = TextureUsage.RENDER_TARGET;

  needsClear = true;
  texture: Texture | null = null;
  attachment: RenderTarget;
  age = 0;

  constructor(device: Device, desc: Readonly<RGRenderTargetDescription>) {
    this.format = desc.format;
    this.width = desc.width;
    this.height = desc.height;
    this.sampleCount = desc.sampleCount;

    assert(this.sampleCount >= 1);

    if (this.sampleCount > 1) {
      // MSAA render targets must be backed by attachments.
      this.attachment = device.createRenderTarget(this);
    } else {
      // Single-sampled textures can be backed by regular textures.
      this.texture = device.createTexture(this);
      this.attachment = device.createRenderTargetFromTexture(this.texture);
    }
  }

  setDebugName(device: Device, debugName: string): void {
    this.debugName = debugName;
    if (this.texture !== null) {
      device.setResourceName(this.texture, this.debugName);
    }
    device.setResourceName(this.attachment, this.debugName);
  }

  matchesDescription(desc: Readonly<RGRenderTargetDescription>): boolean {
    return (
      this.format === desc.format &&
      this.width === desc.width &&
      this.height === desc.height &&
      this.sampleCount === desc.sampleCount
    );
  }

  reset(desc: Readonly<RGRenderTargetDescription>): void {
    assert(this.matchesDescription(desc));
    this.age = 0;
  }

  destroy(): void {
    this.attachment.destroy();
  }
}
