import { AbstractRendererPlugin, Module } from '@antv/g';
import { DOMInteractionPlugin } from './DOMInteractionPlugin';

const containerModule = Module((register) => {
  register(DOMInteractionPlugin);
});

export class Plugin extends AbstractRendererPlugin {
  name = 'dom-interaction';
  init(): void {
    this.container.load(containerModule, true);
  }
  destroy(): void {
    this.container.unload(containerModule);
  }
}
