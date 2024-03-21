import {
  CanvasConfig,
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
} from '@antv/g-lite';
import { isString } from '@antv/util';
import { mat4 } from 'gl-matrix';

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
  private imageCache: Record<string, HTMLImageElement> = {};
  private gradientCache: Record<string, CanvasGradient> = {};
  private patternCache: Record<string, CanvasPattern> = {};

  constructor(private canvasConfig: Partial<CanvasConfig>) {}

  getImageSync(src: string, callback?: (img: HTMLImageElement) => void) {
    if (!this.imageCache[src]) {
      this.getOrCreateImage(src).then((img) => {
        if (callback) {
          callback(img);
        }
      });
    } else {
      if (callback) {
        callback(this.imageCache[src]);
      }
    }

    return this.imageCache[src];
  }

  getOrCreateImage(src: string): Promise<HTMLImageElement> {
    if (this.imageCache[src]) {
      return Promise.resolve(this.imageCache[src]);
    }

    // @see https://github.com/antvis/g/issues/938
    const { createImage } = this.canvasConfig;

    return new Promise((resolve, reject) => {
      let image: HTMLImageElement;
      if (createImage) {
        image = createImage(src);
      } else if (isBrowser) {
        image = new window.Image();
      }

      if (image) {
        image.onload = () => {
          this.imageCache[src] = image;
          resolve(image);
        };
        image.onerror = (ev) => {
          reject(ev);
        };
        image.crossOrigin = 'Anonymous';
        image.src = src;
      }
    });
  }

  getOrCreatePatternSync(
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
      src = this.getImageSync(image, callback);
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
      const { x1, y1, x2, y2 } = computeLinearGradient(min, width, height, angle);
      // @see https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/createLinearGradient
      gradient = context.createLinearGradient(x1, y1, x2, y2);
    } else if (type === GradientType.RadialGradient) {
      const { x, y, r } = computeRadialGradient(min, width, height, cx, cy, size);
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
    } else if ((image as Rect).nodeName === 'rect') {
      return `pattern-${(image as Rect).entity}-${repetition}`;
    }
  }
}
