import { AbstractRendererPlugin } from '../..';
import { HTMLRenderingPlugin } from './HTMLRenderingPlugin';

export class Plugin extends AbstractRendererPlugin {
  name = 'html-renderer';
  constructor(private useNativeHTML = false) {
    super();
  }
  init(): void {
    this.addRenderingPlugin(new HTMLRenderingPlugin(this.useNativeHTML));
  }
  destroy(): void {
    this.removeAllRenderingPlugins();
  }
}
