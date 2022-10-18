import { AbstractRendererPlugin } from '@antv/g-lite';
import { SVGPickerPlugin } from './SVGPickerPlugin';

export class Plugin extends AbstractRendererPlugin {
  name = 'svg-picker';
  init(): void {
    this.addRenderingPlugin(new SVGPickerPlugin());
  }
  destroy(): void {
    this.removeAllRenderingPlugins();
  }
}
