import type { LinearGradient, Pattern, RadialGradient, CanvasConfig } from '@antv/g-lite';
import { UnitType } from '@antv/g-lite';
import {
  computeLinearGradient,
  computeRadialGradient,
  GradientType,
  isBrowser,
} from '@antv/g-lite';
import { isString } from '@antv/util';

export type GradientParams = (LinearGradient & RadialGradient) & {
  width: number;
  height: number;
  type: GradientType;
};
export class ImagePool {
  private imageCache: Record<string, HTMLImageElement> = {};
  private gradientCache: Record<string, CanvasGradient> = {};
  private patternCache: Record<string, CanvasPattern> = {};

  constructor(private canvasConfig: Partial<CanvasConfig>) {}

  getImageSync(src: string, callback?: () => void) {
    if (!this.imageCache[src]) {
      this.getOrCreateImage(src).then(() => {
        if (callback) {
          callback();
        }
      });
    } else {
      if (callback) {
        callback();
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
          resolve(image);
        };
        image.onerror = (ev) => {
          reject(ev);
        };
        image.crossOrigin = 'Anonymous';
        image.src = src;
        this.imageCache[src] = image;
      }
    });
  }

  getOrCreatePatternSync(
    pattern: Pattern,
    context: CanvasRenderingContext2D,
    callback: () => void,
  ) {
    const patternKey = this.generatePatternKey(pattern);
    if (patternKey && this.patternCache[patternKey]) {
      return this.patternCache[patternKey];
    }

    const { image, repetition } = pattern;
    let src: CanvasImageSource;
    // Image URL
    if (isString(image)) {
      src = this.getImageSync(image, callback);
    } else {
      src = image as CanvasImageSource;
    }

    // @see https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/createPattern
    const canvasPattern = src && context.createPattern(src, repetition);

    if (patternKey && canvasPattern) {
      this.patternCache[patternKey] = canvasPattern;
    }

    return canvasPattern;
  }

  getOrCreateGradient(params: GradientParams, context: CanvasRenderingContext2D) {
    const key = this.generateGradientKey(params);
    const { type, steps, width, height, angle, cx, cy, size } = params;

    if (this.gradientCache[key]) {
      return this.gradientCache[key];
    }

    let gradient: CanvasGradient | null = null;
    if (type === GradientType.LinearGradient) {
      const { x1, y1, x2, y2 } = computeLinearGradient(width, height, angle);
      // @see https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/createLinearGradient
      gradient = context.createLinearGradient(x1, y1, x2, y2);
    } else if (type === GradientType.RadialGradient) {
      const { x, y, r } = computeRadialGradient(width, height, cx, cy, size);
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
    const { type, width, height, steps, angle, cx, cy, size } = params;
    return `gradient-${type}-${angle?.toString() || 0}-${cx?.toString() || 0}-${
      cy?.toString() || 0
    }-${size?.toString() || 0}-${width}-${height}-${steps
      .map(({ offset, color }) => `${offset}${color}`)
      .join('-')}`;
  }

  private generatePatternKey(pattern: Pattern) {
    const { image, repetition } = pattern;
    // only generate cache for Image
    if (isString(image)) {
      return `pattern-${image}-${repetition}`;
    }
  }
}
