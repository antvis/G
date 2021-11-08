import { RendererPlugin } from '@antv/g';
import { Module, Syringe } from 'mana-syringe';
import { ControlPlugin } from './ControlPlugin';

export const containerModule = Module((register) => {
  register(ControlPlugin);
});

export class Plugin implements RendererPlugin {
  init(container: Syringe.Container): void {
    container.load(containerModule);
  }
  destroy(container: Syringe.Container): void {
    // container.unload(containerModule);
    // @ts-ignore
    // container.container.unload(containerModule);
  }
}
