import { AbstractRendererPlugin, RenderingPluginContribution } from '@antv/g-lite';
import { ControlPlugin } from './ControlPlugin';

// export const containerModule = Module((register) => {
//   register(ControlPlugin);
// });

export class Plugin extends AbstractRendererPlugin {
  name = 'control';
  init(): void {
    // this.container.load(containerModule, true);
    this.container.registerSingleton(RenderingPluginContribution, ControlPlugin);
  }
  destroy(): void {
    // this.container.unload(containerModule);
  }
}
