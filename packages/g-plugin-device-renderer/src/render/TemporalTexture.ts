import type { Device, Texture } from '@antv/g-device-api';
import { assert } from '@antv/g-device-api';
import type { RGRenderTargetDescription } from './RenderTargetDescription';
import { SingleSampledTexture } from './SingleSampledTexture';

// Public API for saving off copies of images for temporal-style effects.
export class TemporalTexture {
  // These names might be a bit confusing, but they're named relative to the graph.
  // outputTexture is the target of a resolve, inputTexture is the source for sampling.

  private inputTexture: SingleSampledTexture | null = null;
  private outputTexture: SingleSampledTexture | null = null;

  setDescription(
    device: Device,
    desc: Readonly<RGRenderTargetDescription>,
  ): void {
    // Updating the description will happen at the start of the frame,
    // so we need to keep the inputTexture alive (the previous frame's texture),
    // and create a new outputTexture.

    if (this.inputTexture !== this.outputTexture) {
      if (this.inputTexture !== null) this.inputTexture.destroy();

      // Set the input texture to our old output texture.
      this.inputTexture = this.outputTexture;
    }

    assert(this.inputTexture === this.outputTexture);

    if (
      this.outputTexture !== null &&
      this.outputTexture.matchesDescription(desc)
    )
      return;

    this.outputTexture = new SingleSampledTexture(device, desc);
    if (this.inputTexture === null) this.inputTexture = this.outputTexture;
  }

  getTextureForSampling(): Texture | null {
    return this.inputTexture !== null ? this.inputTexture.texture : null;
  }

  getTextureForResolving(): Texture {
    return this.outputTexture?.texture;
  }

  destroy(): void {
    if (
      this.outputTexture !== null &&
      this.outputTexture !== this.inputTexture
    ) {
      this.outputTexture.destroy();
      this.outputTexture = null;
    }
    if (this.inputTexture !== null) {
      this.inputTexture.destroy();
      this.inputTexture = null;
    }
  }
}
