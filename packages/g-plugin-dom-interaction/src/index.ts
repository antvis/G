import type { RendererPlugin } from '@antv/g';
import type { Syringe } from 'mana-syringe';
import { Module } from 'mana-syringe';
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
