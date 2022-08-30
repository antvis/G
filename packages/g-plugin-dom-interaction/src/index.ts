import { AbstractRendererPlugin, RenderingPluginContribution } from '@antv/g-lite';
import { DOMInteractionPlugin } from './DOMInteractionPlugin';

export class Plugin extends AbstractRendererPlugin {
  name = 'dom-interaction';
  init(): void {
    this.container.registerSingleton(RenderingPluginContribution, DOMInteractionPlugin);
  }
  destroy(): void {
    // this.container.unload(containerModule);
  }
}
