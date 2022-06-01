import type { RendererPlugin } from '@antv/g';
import type { Syringe } from 'mana-syringe';
import { Module } from 'mana-syringe';
import { CanvaskitRendererPlugin } from './CanvaskitRendererPlugin';

export * from './interfaces';

const containerModule = Module((register) => {
  register(CanvaskitRendererPlugin);
});

export class Plugin implements RendererPlugin {
  name = 'canvaskit-renderer';
  init(container: Syringe.Container): void {
    container.load(containerModule, true);
  }
  destroy(container: Syringe.Container): void {
    container.unload(containerModule);
  }
}
