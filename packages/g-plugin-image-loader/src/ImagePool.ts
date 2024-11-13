import {
  DisplayObject,
  GradientType,
  LinearGradient,
  Pattern,
  RadialGradient,
  Rect,
  Tuple3Number,
  UnitType,
  computeLinearGradient,
  computeRadialGradient,
  isBrowser,
  parseTransform,
  parsedTransformToMat4,
  Image,
  OffscreenCanvasCreator,
  ElementEvent,
  type CanvasContext,
  type GlobalRuntime,
} from '@antv/g-lite';
import { isString } from '@antv/util';
import { mat4 } from 'gl-matrix';
import { RefCountCache } from './RefCountCache';
import { type SliceResult, ImageSlicer } from './ImageSlicer';

export interface ImageCache extends Partial<SliceResult> {
  img: HTMLImageElement;
  /** [width, height] */
  size: [number, number];
  downSampled?: ImageBitmap | HTMLImageElement;
  downSamplingRate?: number;
}

const IMAGE_CACHE = new RefCountCache<ImageCache, DisplayObject>();
IMAGE_CACHE.onRefAdded = function onRefAdded(
  this: RefCountCache<ImageCache, DisplayObject>,
  ref,
) {
  ref.addEventListener(
    ElementEvent.DESTROY,
    () => {
      this.releaseRef(ref);
    },
    { once: true },
  );
};

export type GradientParams = (LinearGradient & RadialGradient) & {
  width: number;
  height: number;
  /**
   * Top-left corner
   */
  min: [number, number];
  type: GradientType;
};

export class ImagePool {
  static isSupportTile = !!OffscreenCanvasCreator.createCanvas();
  private gradientCache: Record<string, CanvasGradient> = {};
  private patternCache: Record<string, CanvasPattern> = {};

  constructor(
    public context: CanvasContext,
    private runtime: GlobalRuntime,
  ) {}

  getImageSync(
    src: Image['attributes']['src'],
    ref: DisplayObject,
    callback?: (cache: ImageCache) => void,
  ): ImageCache | null {
    const imageSource = isString(src) ? src : src.src;

    if (IMAGE_CACHE.has(imageSource)) {
      const imageCache = IMAGE_CACHE.get(imageSource, ref);

      if (imageCache.img.complete) {
        callback?.(imageCache);

        return imageCache;
      }
    }

    this.getOrCreateImage(src, ref)
      .then((cache) => {
        callback?.(cache);
      })
      .catch(() => {
        //
      });

    return null;
  }

  getOrCreateImage(
    src: Image['attributes']['src'],
    ref: DisplayObject,
  ): Promise<ImageCache> {
    const imageSource = isString(src) ? src : src.src;

    if (!isString(src) && !IMAGE_CACHE.has(imageSource)) {
      const imageCache: ImageCache = {
        img: src,
        size: [src.naturalWidth || src.width, src.naturalHeight || src.height],
        tileSize: calculateImageTileSize(src),
      };

      IMAGE_CACHE.put(imageSource, imageCache, ref);
    }

    if (IMAGE_CACHE.has(imageSource)) {
      const imageCache = IMAGE_CACHE.get(imageSource, ref);

      if (imageCache.img.complete) {
        return Promise.resolve(imageCache);
      }

      return new Promise((resolve, reject) => {
        imageCache.img.addEventListener('load', () => {
          imageCache.size = [
            imageCache.img.naturalWidth || imageCache.img.width,
            imageCache.img.naturalHeight || imageCache.img.height,
          ];
          imageCache.tileSize = calculateImageTileSize(imageCache.img);
          resolve(imageCache);
        });

        imageCache.img.addEventListener('error', (ev) => {
          reject(ev);
        });
      });
    }

    // @see https://github.com/antvis/g/issues/938
    const { createImage } = this.context.config;

    return new Promise((resolve, reject) => {
      let image: HTMLImageElement;
      if (createImage) {
        image = createImage(imageSource);
      } else if (isBrowser) {
        image = new window.Image();
      }

      if (image) {
        const imageCache: ImageCache = {
          img: image,
          size: [0, 0],
          tileSize: calculateImageTileSize(image),
        };

        IMAGE_CACHE.put(imageSource, imageCache, ref);

        image.onload = () => {
          imageCache.size = [
            image.naturalWidth || image.width,
            image.naturalHeight || image.height,
          ];
          imageCache.tileSize = calculateImageTileSize(imageCache.img);
          resolve(imageCache);
        };
        image.onerror = (ev) => {
          reject(ev);
        };
        image.crossOrigin = 'Anonymous';
        image.src = imageSource;
      }
    });
  }

  async createDownSampledImage(
    src: Image['attributes']['src'],
    ref: DisplayObject,
  ): Promise<ImageCache> {
    const imageCache = await this.getOrCreateImage(src, ref);
    if (typeof imageCache.downSamplingRate !== 'undefined') {
      return imageCache;
    }

    const { enableLargeImageOptimization } = this.context.config;
    const { maxDownSampledImageSize = 2048, downSamplingRateThreshold = 0.5 } =
      typeof enableLargeImageOptimization === 'boolean'
        ? {}
        : enableLargeImageOptimization;
    const createImageBitmapFunc = this.runtime.globalThis
      .createImageBitmap as typeof createImageBitmap;
    const [originWidth, originHeight] = imageCache.size;
    let resizedImage: ImageCache['downSampled'] = imageCache.img;
    let downSamplingRate = Math.min(
      (maxDownSampledImageSize + maxDownSampledImageSize) /
        (originWidth + originHeight),
      Math.max(0.01, Math.min(downSamplingRateThreshold, 0.5)),
    );

    let updateCache: ImageCache = {
      ...imageCache,
      downSamplingRate,
    };

    IMAGE_CACHE.update(imageCache.img.src, updateCache, ref);

    if (createImageBitmapFunc) {
      try {
        resizedImage = await createImageBitmapFunc(imageCache.img, {
          resizeWidth: originWidth * downSamplingRate,
          resizeHeight: originHeight * downSamplingRate,
        });
      } catch {
        downSamplingRate = 1;
      }
    } else {
      downSamplingRate = 1;
    }

    updateCache = {
      ...this.getImageSync(src, ref),
      downSampled: resizedImage,
      downSamplingRate,
    };

    IMAGE_CACHE.update(imageCache.img.src, updateCache, ref);

    return updateCache;
  }

  async createImageTiles(
    src: Image['attributes']['src'],
    tiles: [number, number][],
    rerender: () => void,
    ref: DisplayObject,
  ): Promise<ImageCache> {
    const imageCache = await this.getOrCreateImage(src, ref);
    const { requestAnimationFrame, cancelAnimationFrame } =
      ref.ownerDocument.defaultView;

    ImageSlicer.api = {
      requestAnimationFrame,
      cancelAnimationFrame,
      createCanvas: () => OffscreenCanvasCreator.createCanvas(),
    };

    const updateCache: ImageCache = {
      ...imageCache,
      ...ImageSlicer.sliceImage(
        imageCache.img,
        imageCache.tileSize[0],
        imageCache.tileSize[0],
        rerender,
      ),
    };

    IMAGE_CACHE.update(imageCache.img.src, updateCache, ref);

    return updateCache;
  }

  releaseImage(src: Image['attributes']['src'], ref: DisplayObject) {
    IMAGE_CACHE.release(isString(src) ? src : src.src, ref);
  }

  releaseImageRef(ref: DisplayObject) {
    IMAGE_CACHE.releaseRef(ref);
  }

  getOrCreatePatternSync(
    object: DisplayObject,
    pattern: Pattern,
    context: CanvasRenderingContext2D,
    $offscreenCanvas: HTMLCanvasElement,
    dpr: number,
    min: Tuple3Number,
    callback: () => void,
  ) {
    const patternKey = this.generatePatternKey(pattern);
    if (patternKey && this.patternCache[patternKey]) {
      return this.patternCache[patternKey];
    }

    const { image, repetition, transform } = pattern;
    let src: CanvasImageSource;
    let needScaleWithDPR = false;
    // Image URL
    if (isString(image)) {
      const imageCache = this.getImageSync(image, object, callback);
      src = imageCache?.img;
    } else if ($offscreenCanvas) {
      src = $offscreenCanvas;
      needScaleWithDPR = true;
    } else {
      src = image as CanvasImageSource;
    }

    // @see https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/createPattern
    const canvasPattern = src && context.createPattern(src, repetition);

    if (canvasPattern) {
      let mat: mat4;
      // @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasPattern/setTransform
      if (transform) {
        mat = parsedTransformToMat4(
          parseTransform(transform),
          new DisplayObject({}),
        );
      } else {
        mat = mat4.identity(mat4.create());
      }

      if (needScaleWithDPR) {
        mat4.scale(mat, mat, [1 / dpr, 1 / dpr, 1]);
      }

      canvasPattern.setTransform({
        a: mat[0],
        b: mat[1],
        c: mat[4],
        d: mat[5],
        e: mat[12] + min[0],
        f: mat[13] + min[1],
      });
    }

    if (patternKey && canvasPattern) {
      this.patternCache[patternKey] = canvasPattern;
    }

    return canvasPattern;
  }

  getOrCreateGradient(
    params: GradientParams,
    context: CanvasRenderingContext2D,
  ) {
    const key = this.generateGradientKey(params);
    const { type, steps, min, width, height, angle, cx, cy, size } = params;

    if (this.gradientCache[key]) {
      return this.gradientCache[key];
    }

    let gradient: CanvasGradient | null = null;
    if (type === GradientType.LinearGradient) {
      const { x1, y1, x2, y2 } = computeLinearGradient(
        min,
        width,
        height,
        angle,
      );
      // @see https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/createLinearGradient
      gradient = context.createLinearGradient(x1, y1, x2, y2);
    } else if (type === GradientType.RadialGradient) {
      const { x, y, r } = computeRadialGradient(
        min,
        width,
        height,
        cx,
        cy,
        size,
      );
      // @see https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/createRadialGradient
      gradient = context.createRadialGradient(x, y, 0, x, y, r);
    }

    if (gradient) {
      steps.forEach(({ offset, color }) => {
        if (offset.unit === UnitType.kPercentage) {
          gradient?.addColorStop(offset.value / 100, color.toString());
        }
      });

      this.gradientCache[key] = gradient;
    }

    return this.gradientCache[key];
  }

  private generateGradientKey(params: GradientParams): string {
    const { type, min, width, height, steps, angle, cx, cy, size } = params;
    return `gradient-${type}-${angle?.toString() || 0}-${cx?.toString() || 0}-${
      cy?.toString() || 0
    }-${size?.toString() || 0}-${min[0]}-${min[1]}-${width}-${height}-${steps
      .map(({ offset, color }) => `${offset}${color}`)
      .join('-')}`;
  }

  private generatePatternKey(pattern: Pattern) {
    const { image, repetition } = pattern;
    // only generate cache for Image
    if (isString(image)) {
      return `pattern-${image}-${repetition}`;
    }
    if ((image as Rect).nodeName === 'rect') {
      return `pattern-${(image as Rect).entity}-${repetition}`;
    }
  }
}

function calculateImageTileSize(img: HTMLImageElement): [number, number] {
  if (!img.complete) {
    return [0, 0];
  }

  const [width, height] = [
    img.naturalWidth || img.width,
    img.naturalHeight || img.height,
  ];

  let tileSize = 256;

  [256, 512].forEach((size) => {
    const rows = Math.ceil(height / size);
    const cols = Math.ceil(width / size);

    if (rows * cols < 1e3) {
      tileSize = size;
    }
  });

  return [tileSize, tileSize];
}
