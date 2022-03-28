import type { Pattern } from '@antv/g';
import { singleton } from 'mana-syringe';

@singleton()
export class ImagePool {
  private imageCache: Record<string, HTMLImageElement> = {};
  private patternCache: Record<string, CanvasPattern> = {};

  getImageSync(src: string) {
    return this.imageCache[src];
  }

  getOrCreateImage(src: string): Promise<HTMLImageElement> {
    if (this.imageCache[src]) {
      return Promise.resolve(this.imageCache[src]);
    }

    return new Promise((resolve, reject) => {
      const image = new window.Image();
      image.onload = () => {
        resolve(image);
      };
      image.onerror = (ev) => {
        reject(ev);
      };
      image.crossOrigin = 'Anonymous';
      image.src = src;
      this.imageCache[src] = image;
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
