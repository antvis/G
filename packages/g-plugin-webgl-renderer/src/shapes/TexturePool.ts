import { PARSED_COLOR_TYPE, OffscreenCanvasCreator, LinearGradient, RadialGradient } from '@antv/g';
import { inject, injectable } from 'inversify';
import { ITexture2D, ITexture2DInitializationOptions, RenderingEngine } from '../services/renderer';

export type GradientParams = (LinearGradient | RadialGradient) & {
  width: number;
  height: number;
  type: PARSED_COLOR_TYPE;
};

@injectable()
export class TexturePool {
  @inject(OffscreenCanvasCreator)
  private offscreenCanvas: OffscreenCanvasCreator;

  private textureCache: Record<string, ITexture2D> = {};
  private gradientCache: Record<string, CanvasGradient> = {};

  getOrCreateTexture2D(
    engine: RenderingEngine,
    src: string | HTMLImageElement | HTMLCanvasElement | OffscreenCanvas,
    options: ITexture2DInitializationOptions,
  ): Promise<ITexture2D> {
    if (typeof src === 'string') {
      if (this.textureCache[src]) {
        return Promise.resolve(this.textureCache[src]);
      }

      return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
          const texture = engine.createTexture2D({
            ...options,
            data: image,
            width: options.width || image.width,
            height: options.height || image.height,
          });
          this.textureCache[src] = texture;
          resolve(texture);
        };
        image.onerror = (ev) => {
          reject(ev);
        };
        image.crossOrigin = 'Anonymous';
        image.src = src;
      });
    } else {
      return Promise.resolve(
        engine.createTexture2D({
          ...options,
          data: src,
        }),
      );
    }
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
    // no need to destroy texture here
    // Error: (regl) must not double destroy texture
    // for (const key in this.textureCache) {
    //   this.textureCache[key].destroy();
    // }
    this.textureCache = {};
    this.gradientCache = {};
  }
}
