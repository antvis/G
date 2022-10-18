import { AbstractRendererPlugin } from '@antv/g-lite';
import { ImagePool } from './ImagePool';
import { LoadImagePlugin } from './LoadImagePlugin';

export { ImagePool };

export class Plugin extends AbstractRendererPlugin {
  name = 'image-loader';
  init(): void {
    // @ts-ignore
    this.context.imagePool = new ImagePool(this.context.config);
    this.addRenderingPlugin(new LoadImagePlugin());
  }
  destroy(): void {
    this.removeAllRenderingPlugins();
  }
}
