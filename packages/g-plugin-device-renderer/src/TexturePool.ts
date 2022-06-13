import type { CSSGradientValue, DisplayObject, LinearGradient, RadialGradient } from '@antv/g';
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

export interface GradientParams {
  width: number;
  height: number;
  gradients: CSSGradientValue[];
  instance: DisplayObject;
}

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
    const { instance, gradients } = params;
    const { halfExtents } = instance.getGeometryBounds();
    const width = halfExtents[0] * 2 || 1;
    const height = halfExtents[1] * 2 || 1;

    const canvas = this.offscreenCanvas.getOrCreateCanvas(this.canvasConfig.offscreenCanvas);
    const context = this.offscreenCanvas.getOrCreateContext(this.canvasConfig.offscreenCanvas);

    canvas.width = width;
    canvas.height = height;

    gradients.forEach((g) => {
      const key = this.generateCacheKey(g, width, height);
      let gradient: CanvasGradient | null = this.gradientCache[key];

      if (!gradient) {
        const { type } = g;
        const { steps } = g.value as LinearGradient | RadialGradient;

        if (type === GradientPatternType.LinearGradient) {
          const { angle } = g.value as LinearGradient;
          const { x1, y1, x2, y2 } = computeLinearGradient(width, height, angle);
          // @see https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/createLinearGradient
          gradient = context.createLinearGradient(x1, y1, x2, y2);
        } else if (type === GradientPatternType.RadialGradient) {
          const { cx, cy } = g.value as RadialGradient;
          const { x, y, r } = computeRadialGradient(width, height, cx, cy);
          // @see https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/createRadialGradient
          gradient = context.createRadialGradient(x, y, 0, x, y, r);
        }

        steps.forEach(([offset, color]) => {
          gradient.addColorStop(offset, color);
        });

        this.gradientCache[key] = gradient;
      }

      // used as canvas' ID
      // @ts-ignore
      canvas.src = key;

      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);
    });
  }

  private generateCacheKey(params: CSSGradientValue, width: number, height: number): string {
    if (params.type === GradientPatternType.LinearGradient) {
      const { steps, angle } = params.value as LinearGradient;
      return `gradient-${params.type}-${angle || 0}-${width}-${height}-${steps
        .map((step) => step.join(''))
        .join('-')}`;
    } else if (params.type === GradientPatternType.RadialGradient) {
      const { steps, cx, cy } = params.value as RadialGradient;
      return `gradient-${params.type}-${cx || 0}-${cy || 0}-${width}-${height}-${steps
        .map((step) => step.join(''))
        .join('-')}`;
    }
    return '';
  }

  destroy() {
    for (const key in this.textureCache) {
      this.textureCache[key].destroy();
    }
    this.textureCache = {};
    this.gradientCache = {};
  }
}
