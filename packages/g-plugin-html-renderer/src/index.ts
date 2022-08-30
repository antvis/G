import { AbstractRendererPlugin, RenderingPluginContribution } from '@antv/g-lite';
import { HTMLRenderingPlugin } from './HTMLRenderingPlugin';

// const containerModule = Module((register) => {
//   register(HTMLRenderingPlugin);
// });

export class Plugin extends AbstractRendererPlugin {
  name = 'html-renderer';
  init(): void {
    this.container.registerSingleton(RenderingPluginContribution, HTMLRenderingPlugin);
  }
  destroy(): void {
    // this.container.unload(containerModule);
  }
}
