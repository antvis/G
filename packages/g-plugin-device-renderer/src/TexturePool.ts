import {
  CanvasContext,
  CSSGradientValue,
  DisplayObject,
  GlobalRuntime,
  isBrowser,
  LinearGradient,
  parsedTransformToMat4,
  parseTransform,
  Pattern,
  RadialGradient,
} from '@antv/g-lite';
import type { ImagePool } from '@antv/g-plugin-image-loader';
import { isString } from '@antv/util';
import type { Device, Texture, TextureDescriptor } from '@antv/g-device-api';
import {
  Format,
  TextureDimension,
  TextureEvent,
  TextureUsage,
} from '@antv/g-device-api';

export interface GradientParams {
  width: number;
  height: number;
  gradients: CSSGradientValue[];
  instance: DisplayObject;
}

export class TexturePool {
  constructor(
    public context: CanvasContext,
    private runtime: GlobalRuntime,
  ) {}

  private textureCache: Record<string, Texture> = {};

  getOrCreateTexture(
    device: Device,
    src: string | TexImageSource,
    descriptor?: TextureDescriptor,
    successCallback?: (
      t: Texture,
      image: ImageBitmap | HTMLImageElement,
    ) => void,
  ): Texture {
    // use Image URL or src as cache key
    // @ts-ignore
    const id = typeof src === 'string' ? src : src.src || '';
    let texture: Texture;

    if (!id || !this.textureCache[id]) {
      texture = device.createTexture({
        format: Format.U8_RGBA_NORM,
        width: 1,
        height: 1,
        depthOrArrayLayers: 1,
        mipLevelCount: 1,
        dimension: TextureDimension.TEXTURE_2D,
        usage: TextureUsage.SAMPLED,
        pixelStore: {
          unpackFlipY: false,
        },
        ...descriptor,
      });

      if (id) {
        this.textureCache[id] = texture;
      }

      if (!isString(src)) {
        texture.setImageData([src]);
        texture.emit(TextureEvent.LOADED);
        this.context.renderingService.dirtify();
      } else {
        // @see https://github.com/antvis/g/issues/938
        const { createImage } = this.context.config;

        let image: HTMLImageElement;
        if (createImage) {
          image = createImage(src);
        } else if (isBrowser) {
          image = new window.Image();
        }

        if (image) {
          image.onload = () => {
            const onSuccess = (bitmap: ImageBitmap | HTMLImageElement) => {
              this.textureCache[id].setImageData([bitmap]);
              this.textureCache[id].emit(TextureEvent.LOADED);
              this.context.renderingService.dirtify();
              if (successCallback) {
                successCallback(this.textureCache[id], bitmap);
              }
            };

            if (this.runtime.globalThis.createImageBitmap) {
              this.runtime.globalThis
                .createImageBitmap(image)
                .then((bitmap: ImageBitmap) => onSuccess(bitmap))
                .catch(() => {
                  // Unhandled Rejection (InvalidStateError):
                  // Failed to execute 'createImageBitmap' on 'Window':
                  // The image element contains an SVG image without intrinsic dimensions,
                  // and no resize options or crop region are specified.
                  onSuccess(image);
                });
            } else {
              onSuccess(image);
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
    return this.runtime.offscreenCanvasCreator.getOrCreateCanvas(
      this.context.config.offscreenCanvas,
    );
  }

  getOrCreateGradient(params: GradientParams) {
    const { instance, gradients } = params;
    const { halfExtents } = instance.getGeometryBounds();
    const width = halfExtents[0] * 2 || 1;
    const height = halfExtents[1] * 2 || 1;

    const { offscreenCanvas } = this.context.config;
    const canvas =
      this.runtime.offscreenCanvasCreator.getOrCreateCanvas(offscreenCanvas);
    const context = this.runtime.offscreenCanvasCreator.getOrCreateContext(
      offscreenCanvas,
    ) as CanvasRenderingContext2D;

    canvas.width = width;
    canvas.height = height;

    // @ts-ignore
    const imagePool = this.context.imagePool as ImagePool;

    gradients.forEach((g) => {
      const gradient = imagePool.getOrCreateGradient(
        {
          type: g.type,
          ...(g.value as LinearGradient & RadialGradient),
          width,
          height,
          min: [0, 0],
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

  getOrCreatePattern(
    pattern: Pattern,
    instance: DisplayObject,
    callback: () => void,
  ) {
    const { image, repetition, transform } = pattern;
    const { halfExtents } = instance.getGeometryBounds();
    const width = halfExtents[0] * 2 || 1;
    const height = halfExtents[1] * 2 || 1;
    const { offscreenCanvas } = this.context.config;

    const canvas =
      this.runtime.offscreenCanvasCreator.getOrCreateCanvas(offscreenCanvas);
    const context =
      this.runtime.offscreenCanvasCreator.getOrCreateContext(offscreenCanvas);

    canvas.width = width;
    canvas.height = height;

    let src: CanvasImageSource;
    // Image URL
    if (isString(image)) {
      const imageCache = (this.context.imagePool as ImagePool).getImageSync(
        image,
        instance,
        callback,
      );
      src = imageCache?.img;
    } else {
      src = image as CanvasImageSource;
    }

    const canvasPattern = src && context.createPattern(src, repetition);

    // @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasPattern/setTransform
    if (transform) {
      const mat = parsedTransformToMat4(
        parseTransform(transform),
        new DisplayObject({}),
      );
      canvasPattern.setTransform({
        a: mat[0],
        b: mat[1],
        c: mat[4],
        d: mat[5],
        e: mat[12],
        f: mat[13],
      });
    }

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
