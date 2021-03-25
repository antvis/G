import { inject, injectable } from 'inversify';
import { ITexture2D, ITexture2DInitializationOptions, RenderingEngine } from '../services/renderer';

@injectable()
export class TexturePool {
  @inject(RenderingEngine)
  private readonly engine: RenderingEngine;

  private textureCache: Record<string, ITexture2D> = {};

  async getOrCreateTexture2D(
    src: string | HTMLImageElement,
    options: ITexture2DInitializationOptions
  ): Promise<ITexture2D> {
    if (typeof src === 'string') {
      if (this.textureCache[src]) {
        return this.textureCache[src];
      }

      return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
          const texture = this.engine.createTexture2D({
            ...options,
            data: image,
            // width: options.width || image.width,
            // height: options.height || image.height,
            // flipY: true,
          });
          this.textureCache[src] = texture;
          resolve(texture);
        };
        image.onerror = (ev) => {
          reject(ev);
        };
        image.crossOrigin = 'Anonymous';
        image.src = src;
      });
    } else {
      return this.engine.createTexture2D({
        ...options,
        data: src,
        flipY: true,
      });
    }
  }

  destroy() {
    for (const key in this.textureCache) {
      this.textureCache[key].destroy();
    }
    this.textureCache = {};
  }
}
