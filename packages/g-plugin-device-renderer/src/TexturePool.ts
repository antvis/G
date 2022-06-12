import type { LinearGradient, RadialGradient } from '@antv/g';
import {
  CanvasConfig,
  computeLinearGradient,
  computeRadialGradient,
  GradientPatternType,
  inject,
  isBrowser,
  OffscreenCanvasCreator,
  RenderingService,
  singleton,
} from '@antv/g';
import type { Device, Texture, TextureDescriptor } from './platform';
import { Format, TextureDimension, TextureEvent, TextureUsage } from './platform';

export type GradientParams = (LinearGradient | RadialGradient) & {
  width: number;
  height: number;
  type: GradientPatternType;
};

@singleton()
export class TexturePool {
  @inject(OffscreenCanvasCreator)
  private offscreenCanvas: OffscreenCanvasCreator;

  @inject(RenderingService)
  private renderingService: RenderingService;

  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  private textureCache: Record<string, Texture> = {};
  private gradientCache: Record<string, CanvasGradient> = {};

  getOrCreateTexture(
    device: Device,
    src: string | TexImageSource,
    descriptor?: TextureDescriptor,
    successCallback?: (t: Texture) => void,
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
        this.textureCache[id].emit(TextureEvent.LOADED);
        this.renderingService.dirtify();
      } else {
        // @see https://github.com/antvis/g/issues/938
        const { createImage } = this.canvasConfig;

        let image: HTMLImageElement;
        if (createImage) {
          image = createImage(src);
        } else if (isBrowser) {
          image = new window.Image();
        }

        if (image) {
          image.onload = () => {
            this.textureCache[id].setImageData(image);
            this.textureCache[id].emit(TextureEvent.LOADED);
            this.renderingService.dirtify();
            if (successCallback) {
              successCallback(this.textureCache[id]);
            }
          };
          image.onerror = () => {};
          image.crossOrigin = 'Anonymous';
          image.src = src;
        }
      }
    } else {
      this.textureCache[id].emit(TextureEvent.LOADED);
    }
    return this.textureCache[id];
  }

  getOrCreateCanvas() {
    return this.offscreenCanvas.getOrCreateCanvas(this.canvasConfig.offscreenCanvas);
  }

  getOrCreateGradient(params: GradientParams) {
    const key = this.generateCacheKey(params);
    // @ts-ignore
    const { type, steps, width, height, angle, cx, cy } = params;

    let gradient: CanvasGradient | null = this.gradientCache[key];
    const canvas = this.offscreenCanvas.getOrCreateCanvas(this.canvasConfig.offscreenCanvas);
    const context = this.offscreenCanvas.getOrCreateContext(this.canvasConfig.offscreenCanvas);
    if (!gradient) {
      canvas.width = width;
      canvas.height = height; // needs only 1px height

      if (type === GradientPatternType.LinearGradient) {
        const { x1, y1, x2, y2 } = computeLinearGradient(width, height, angle);
        // @see https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/createLinearGradient
        gradient = context.createLinearGradient(x1, y1, x2, y2);
      } else if (type === GradientPatternType.RadialGradient) {
        const { x, y, r } = computeRadialGradient(width, height, cx, cy);
        // @see https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/createRadialGradient
        gradient = context.createRadialGradient(x, y, 0, x, y, r);
      }

      steps.forEach(([offset, color]) => {
        gradient?.addColorStop(offset, color);
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
    const { type, width, height, steps, angle, cx, cy } = params;
    return `gradient-${type}-${angle || 0}-${cx || 0}-${cy || 0}-${width}-${height}-${steps
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
