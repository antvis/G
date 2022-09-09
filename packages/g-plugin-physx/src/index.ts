import { AbstractRendererPlugin, Module } from '@antv/g-lite';
import { PhysXPlugin } from './PhysXPlugin';

const containerModule = Module((register) => {
  register(PhysXPlugin);
});

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PhysXPluginOptions {}

export class Plugin extends AbstractRendererPlugin {
  name = 'physx';
  constructor(private options: Partial<PhysXPluginOptions>) {
    super();
  }

  init(): void {
    this.container.load(containerModule, true);
  }
  destroy(): void {
    this.container.unload(containerModule);
  }
}
