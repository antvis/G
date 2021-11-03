import { PARSED_COLOR_TYPE, OffscreenCanvasCreator, LinearGradient, RadialGradient } from '@antv/g';
import { inject, injectable } from 'inversify';
import { Device, Texture, TextureDescriptor } from './platform';

export type GradientParams = (LinearGradient | RadialGradient) & {
  width: number;
  height: number;
  type: PARSED_COLOR_TYPE;
};

@injectable()
export class TexturePool {
  @inject(OffscreenCanvasCreator)
  private offscreenCanvas: OffscreenCanvasCreator;

  private textureCache: Record<string, Texture> = {};
  private gradientCache: Record<string, CanvasGradient> = {};

  getOrCreateTexture(
    device: Device,
    src: string | TexImageSource,
    descriptor: TextureDescriptor,
    successCallback: Function,
  ): Texture {
    // @ts-ignore
    const id = typeof src === 'string' ? src : src.src || '';

    if (!this.textureCache[id]) {
      this.textureCache[id] = device.createTexture({
        ...descriptor,
        immutable: false,
      });
      if (typeof src !== 'string') {
        this.textureCache[id].setImageData(src, 0);
      } else {
        const image = new Image();
        image.onload = () => {
          this.textureCache[id].setImageData(image, 0);
          successCallback();
        };
        image.onerror = () => {};
        image.crossOrigin = 'Anonymous';
        image.src = src;
      }
    }
    return this.textureCache[id];
  }

  getOrCreateCanvas() {
    return this.offscreenCanvas.getOrCreateCanvas();
  }

  getOrCreateGradient(params: GradientParams) {
    const key = this.generateCacheKey(params);
    const { type, x0, y0, x1, y1, steps, width, height } = params;

    let gradient: CanvasGradient | null = this.gradientCache[key];
    const canvas = this.offscreenCanvas.getOrCreateCanvas();
    const context = this.offscreenCanvas.getOrCreateContext();
    if (!gradient) {
      canvas.width = width;
      canvas.height = height; // needs only 1px height

      if (type === PARSED_COLOR_TYPE.LinearGradient) {
        // @see https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/createLinearGradient
        gradient = context.createLinearGradient(x0 * width, y0 * height, x1 * width, y1 * height);
      } else if (type === PARSED_COLOR_TYPE.RadialGradient) {
        const r = Math.sqrt(width * width + height * height) / 2;
        // @see https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/createRadialGradient
        gradient = context.createRadialGradient(
          x0 * width,
          y0 * height,
          0,
          x1 * width,
          y1 * height,
          (params as RadialGradient).r1 * r,
        );
      }

      steps.forEach(([offset, color]) => {
        gradient?.addColorStop(Number(offset), color);
      });

      this.gradientCache[key] = gradient;
    }

    if (gradient) {
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);
    }
  }

  private generateCacheKey(params: GradientParams): string {
    // @ts-ignore
    const { type, x0, y0, x1, y1, r1, steps, width, height } = params;
    return `gradient-${type}-${x0}-${y0}-${x1}-${y1}-${r1 || 0}-${width}-${height}-${steps
      .map((step) => step.join(''))
      .join('-')}`;
  }

  destroy() {
    for (const key in this.textureCache) {
      this.textureCache[key].destroy();
    }
    this.textureCache = {};
    this.gradientCache = {};
  }
}
