import { AbstractRendererPlugin } from '../..';
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
