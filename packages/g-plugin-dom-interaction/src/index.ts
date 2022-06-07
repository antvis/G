import type { RendererPlugin, Syringe } from '@antv/g';
import { Module } from '@antv/g';
import { DOMInteractionPlugin } from './DOMInteractionPlugin';

const containerModule = Module((register) => {
  register(DOMInteractionPlugin);
});

export class Plugin implements RendererPlugin {
  name = 'dom-interaction';
  init(container: Syringe.Container): void {
    container.load(containerModule, true);
  }
  destroy(container: Syringe.Container): void {
    container.unload(containerModule);
  }
}
