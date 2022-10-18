import { AbstractRendererPlugin } from '@antv/g-lite';
import { HTMLRenderingPlugin } from './HTMLRenderingPlugin';

export class Plugin extends AbstractRendererPlugin {
  name = 'html-renderer';
  init(): void {
    this.addRenderingPlugin(new HTMLRenderingPlugin());
  }
  destroy(): void {
    this.removeAllRenderingPlugins();
  }
}
