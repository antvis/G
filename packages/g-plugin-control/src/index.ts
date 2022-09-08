import { AbstractRendererPlugin, Module } from '@antv/g-lite';
import { ControlPlugin } from './ControlPlugin';

export const containerModule = Module((register) => {
  register(ControlPlugin);
});

export class Plugin extends AbstractRendererPlugin {
  name = 'control';
  init(): void {
    this.container.load(containerModule, true);
  }
  destroy(): void {
    this.container.unload(containerModule);
  }
}
