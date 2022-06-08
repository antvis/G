import type { RendererPlugin, Syringe } from '@antv/g';
import { Module } from '@antv/g';
import { ControlPlugin } from './ControlPlugin';

export const containerModule = Module((register) => {
  register(ControlPlugin);
});

export class Plugin implements RendererPlugin {
  name = 'control';
  init(container: Syringe.Container): void {
    container.load(containerModule, true);
  }
  destroy(container: Syringe.Container): void {
    container.unload(containerModule);
  }
}
