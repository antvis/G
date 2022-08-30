import { AbstractRendererPlugin, RenderingPluginContribution } from '@antv/g-lite';
import { SVGRenderer } from '@antv/g-svg';
import { RoughElementLifeCycleContribution } from './RoughElementLifeCycleContribution';
import { RoughRendererPlugin } from './RoughRendererPlugin';

// const containerModule = Module((register) => {
//   register(RoughElementLifeCycleContribution);
//   register(RoughRendererPlugin);
// });

export class Plugin extends AbstractRendererPlugin {
  name = 'rough-svg-renderer';
  init(): void {
    this.container.registerSingleton(
      SVGRenderer.ElementLifeCycleContribution,
      RoughElementLifeCycleContribution,
    );
    this.container.registerSingleton(RenderingPluginContribution, RoughRendererPlugin);
    // this.container.load(containerModule, true);
  }
  destroy(): void {
    // this.container.unload(containerModule);
  }
}
