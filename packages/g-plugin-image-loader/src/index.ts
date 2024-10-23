import { AbstractRendererPlugin, type GlobalRuntime } from '@antv/g-lite';
import { ImagePool, type ImageCache } from './ImagePool';
import { LoadImagePlugin } from './LoadImagePlugin';

export { ImagePool, type ImageCache };

export class Plugin extends AbstractRendererPlugin {
  name = 'image-loader';
  init(runtime: GlobalRuntime): void {
    // @ts-ignore
    this.context.imagePool = new ImagePool(this.context, runtime);
    this.addRenderingPlugin(new LoadImagePlugin());
  }
  destroy(): void {
    this.removeAllRenderingPlugins();
  }
}
