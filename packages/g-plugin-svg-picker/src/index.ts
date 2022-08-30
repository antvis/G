import { AbstractRendererPlugin, RenderingPluginContribution } from '@antv/g-lite';
import { SVGPickerPlugin } from './SVGPickerPlugin';

export class Plugin extends AbstractRendererPlugin {
  name = 'svg-picker';
  init(): void {
    this.container.registerSingleton(RenderingPluginContribution, SVGPickerPlugin);
    // this.container.load(containerModule, true);
  }
  destroy(): void {
    // this.container.unload(containerModule);
  }
}
