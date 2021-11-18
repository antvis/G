import { RendererPlugin } from '@antv/g';
import { Syringe, Module } from 'mana-syringe';
import { DOMInteractionPlugin } from './DOMInteractionPlugin';

const containerModule = Module((register) => {
  register(DOMInteractionPlugin);
});

export class Plugin implements RendererPlugin {
  init(container: Syringe.Container): void {
    container.load(containerModule, true);
  }
  destroy(container: Syringe.Container): void {
    container.remove(DOMInteractionPlugin);
  }
}
