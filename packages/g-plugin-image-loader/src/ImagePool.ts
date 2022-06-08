import type { Pattern } from '@antv/g';
import { CanvasConfig, inject, isBrowser, singleton } from '@antv/g';

@singleton()
export class ImagePool {
  private imageCache: Record<string, HTMLImageElement> = {};
  private patternCache: Record<string, CanvasPattern> = {};

  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  getImageSync(src: string) {
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

  getPatternSync(pattern: Pattern) {
    const patternKey = this.generatePatternKey(pattern);
    if (this.patternCache[patternKey]) {
      return this.patternCache[patternKey];
    }
  }

  createPattern(patternParams: Pattern, context: CanvasRenderingContext2D) {
    return this.getOrCreateImage(patternParams.src).then((image) => {
      const patternKey = this.generatePatternKey(patternParams);
      // @see https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/createPattern
      const pattern = context.createPattern(image, patternParams.repetition);
      if (pattern) {
        this.patternCache[patternKey] = pattern;
      }

      return this.patternCache[patternKey];
    });
  }

  private generatePatternKey(pattern: Pattern) {
    const { src, repetition } = pattern;
    return `pattern-${src}-${repetition}`;
  }
}
