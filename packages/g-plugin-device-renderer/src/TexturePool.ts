import type {
  CSSGradientValue,
  DisplayObject,
  LinearGradient,
  Pattern,
  RadialGradient,
} from '@antv/g-lite';
import {
  CanvasConfig,
  inject,
  isBrowser,
  OffscreenCanvasCreator,
  RenderingService,
  singleton,
} from '@antv/g-lite';
import { ImagePool } from '@antv/g-plugin-image-loader';
import { isString } from '@antv/util';
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
  constructor(
    @inject(ImagePool)
    private imagePool: ImagePool,

    @inject(OffscreenCanvasCreator)
    private offscreenCanvas: OffscreenCanvasCreator,

    @inject(RenderingService)
    private renderingService: RenderingService,

    @inject(CanvasConfig)
    private canvasConfig: CanvasConfig,
  ) {}

  private textureCache: Record<string, Texture> = {};

  getOrCreateTexture(
    device: Device,
    src: string | TexImageSource,
    descriptor?: TextureDescriptor,
    successCallback?: (t: Texture) => void,
  ): Texture {
    // use Image URL or src as cache key
    // @ts-ignore
    const id = typeof src === 'string' ? src : src.src || '';
    let texture: Texture;

    if (!id || !this.textureCache[id]) {
      texture = device.createTexture({
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

      if (id) {
        this.textureCache[id] = texture;
      }

      if (!isString(src)) {
        texture.setImageData(src);
        texture.emit(TextureEvent.LOADED);
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
      texture = this.textureCache[id];
      texture.emit(TextureEvent.LOADED);
    }
    return texture;
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
    const context = this.offscreenCanvas.getOrCreateContext(
      this.canvasConfig.offscreenCanvas,
    ) as CanvasRenderingContext2D;

    canvas.width = width;
    canvas.height = height;

    gradients.forEach((g) => {
      const gradient = this.imagePool.getOrCreateGradient(
        {
          type: g.type,
          ...(g.value as LinearGradient & RadialGradient),
          width,
          height,
        },
        context,
      );

      // used as canvas' ID
      // @ts-ignore
      // canvas.src = key;

      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);
    });
  }

  getOrCreatePattern(pattern: Pattern, instance: DisplayObject, callback: () => void) {
    const { image, repetition } = pattern;
    const { halfExtents } = instance.getGeometryBounds();
    const width = halfExtents[0] * 2 || 1;
    const height = halfExtents[1] * 2 || 1;

    const canvas = this.offscreenCanvas.getOrCreateCanvas(this.canvasConfig.offscreenCanvas);
    const context = this.offscreenCanvas.getOrCreateContext(this.canvasConfig.offscreenCanvas);

    canvas.width = width;
    canvas.height = height;

    let src: CanvasImageSource;
    // Image URL
    if (isString(image)) {
      src = this.imagePool.getImageSync(image, callback);
    } else {
      src = image as CanvasImageSource;
    }

    const canvasPattern = src && context.createPattern(src, repetition);

    context.fillStyle = canvasPattern;
    context.fillRect(0, 0, width, height);
  }

  destroy() {
    for (const key in this.textureCache) {
      this.textureCache[key].destroy();
    }
    this.textureCache = {};
  }
}
