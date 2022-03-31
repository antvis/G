import type { LinearGradient, RadialGradient } from '@antv/g';
import { PARSED_COLOR_TYPE, OffscreenCanvasCreator, CanvasConfig, isBrowser } from '@antv/g';
import { inject, singleton } from 'mana-syringe';
import type { Device, Texture, TextureDescriptor } from './platform';
import { Format, TextureDimension, TextureUsage } from './platform';

export type GradientParams = (LinearGradient | RadialGradient) & {
  width: number;
  height: number;
  type: PARSED_COLOR_TYPE;
};

@singleton()
export class TexturePool {
  @inject(OffscreenCanvasCreator)
  private offscreenCanvas: OffscreenCanvasCreator;

  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  private textureCache: Record<string, Texture> = {};
  private gradientCache: Record<string, CanvasGradient> = {};

  getOrCreateTexture(
    device: Device,
    src: string | TexImageSource,
    descriptor?: TextureDescriptor,
    successCallback?: () => void,
  ): Texture {
    // @ts-ignore
    const id = typeof src === 'string' ? src : src.src || '';

    if (!this.textureCache[id]) {
      this.textureCache[id] = device.createTexture({
        pixelFormat: Format.U8_RGBA_NORM,
        width: 1,
        height: 1,
        depth: 1,
        numLevels: 1,
        dimension: TextureDimension.n2D,
        usage: TextureUsage.Sampled,
        pixelStore: {
          unpackFlipY: false,
        },
        immutable: false,
        ...descriptor,
      });
      if (typeof src !== 'string') {
        this.textureCache[id].setImageData(src);
      } else {
        // @see https://github.com/antvis/g/issues/938
        const { createImage } = this.canvasConfig;

        let image: HTMLImageElement;
        if (createImage) {
          image = createImage();
        } else if (isBrowser) {
          image = new window.Image();
        }

        if (image) {
          image.onload = () => {
            this.textureCache[id].setImageData(image);

            if (successCallback) {
              successCallback();
            }
          };
          image.onerror = () => {};
          image.crossOrigin = 'Anonymous';
          image.src = src;
        }
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

    // used as canvas' ID
    // @ts-ignore
    canvas.src = key;

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
