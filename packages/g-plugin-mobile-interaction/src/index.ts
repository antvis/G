import { AbstractRendererPlugin } from '@antv/g-lite';
import { MobileInteractionPlugin } from './MobileInteractionPlugin';

export class Plugin extends AbstractRendererPlugin {
  name = 'mobile-interaction';
  init(): void {
    this.addRenderingPlugin(new MobileInteractionPlugin());
  }
  destroy(): void {
    this.removeAllRenderingPlugins();
  }
}
