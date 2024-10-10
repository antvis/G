import { AbstractRendererPlugin } from '@antv/g-lite';
import { ControlPlugin } from './ControlPlugin';

export class Plugin extends AbstractRendererPlugin {
  name = 'control';
  init(): void {
    this.addRenderingPlugin(new ControlPlugin());
  }
  destroy(): void {
    this.removeAllRenderingPlugins();
  }
}
