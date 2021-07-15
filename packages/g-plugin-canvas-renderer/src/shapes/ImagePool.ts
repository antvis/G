import { injectable } from 'inversify';

@injectable()
export class ImagePool {
  private imageCache: Record<string, HTMLImageElement> = {};

  getImageSync(src: string) {
    return this.imageCache[src];
  }

  getOrCreateImage(src: string): Promise<HTMLImageElement> {
    if (this.imageCache[src]) {
      return Promise.resolve(this.imageCache[src]);
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
  }
}
