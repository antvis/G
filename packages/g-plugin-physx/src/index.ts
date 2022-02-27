import { RendererPlugin } from '@antv/g';
import { Module, Syringe } from 'mana-syringe';
import { PhysXPlugin } from './PhysXPlugin';

const containerModule = Module((register) => {
  register(PhysXPlugin);
});

export interface PhysXPluginOptions {}

export class Plugin implements RendererPlugin {
  constructor(private options: Partial<PhysXPluginOptions>) {}

  init(container: Syringe.Container): void {
    container.load(containerModule, true);
  }
  destroy(container: Syringe.Container): void {
    container.remove(PhysXPlugin);
    // @ts-ignore
    // container.container.unload(containerModule);
    // container.unload(containerModule);
  }
}
