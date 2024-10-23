import { AbstractRendererPlugin } from '@antv/g-lite';
import { DOMInteractionPlugin } from './DOMInteractionPlugin';

export class Plugin extends AbstractRendererPlugin {
  name = 'dom-interaction';

  init(): void {
    this.addRenderingPlugin(new DOMInteractionPlugin());
  }
  destroy(): void {
    this.removeAllRenderingPlugins();
  }
}
