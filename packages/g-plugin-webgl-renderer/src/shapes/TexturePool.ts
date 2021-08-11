import { injectable } from 'inversify';
import { ITexture2D, ITexture2DInitializationOptions, RenderingEngine } from '../services/renderer';

@injectable()
export class TexturePool {
  private textureCache: Record<string, ITexture2D> = {};

  getOrCreateTexture2D(
    engine: RenderingEngine,
    src: string | HTMLImageElement,
    options: ITexture2DInitializationOptions
  ): Promise<ITexture2D> {
    if (typeof src === 'string') {
      if (this.textureCache[src]) {
        return Promise.resolve(this.textureCache[src]);
      }

      return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
          const texture = engine.createTexture2D({
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
      return Promise.resolve(engine.createTexture2D({
        ...options,
        data: src,
        flipY: true,
      }));
    }
  }

  destroy() {
    // no need to destroy texture here
    // Error: (regl) must not double destroy texture
    // for (const key in this.textureCache) {
    //   this.textureCache[key].destroy();
    // }
    this.textureCache = {};
  }
}
