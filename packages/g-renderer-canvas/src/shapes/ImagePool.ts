import { injectable } from 'inversify';

@injectable()
export class ImagePool {
  private imageCache: Record<string, HTMLImageElement> = {};

  getImageSync(src: string) {
    return this.imageCache[src];
  }

  async getOrCreateImage(src: string | HTMLImageElement, width?: number, height?: number): Promise<HTMLImageElement> {
    if (typeof src === 'string') {
      if (this.imageCache[src]) {
        return this.imageCache[src];
      }

      return new Promise((resolve, reject) => {
        const image = new Image();
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
    } else {
      if (width) {
        src.width = width;
      }
      if (height) {
        src.height = height;
      }
      return src;
    }
  }
}
