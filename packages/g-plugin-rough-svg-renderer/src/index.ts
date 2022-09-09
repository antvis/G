import { AbstractRendererPlugin, Module } from '@antv/g-lite';
import { RoughElementLifeCycleContribution } from './RoughElementLifeCycleContribution';
import { RoughRendererPlugin } from './RoughRendererPlugin';

const containerModule = Module((register) => {
  register(RoughElementLifeCycleContribution);
  register(RoughRendererPlugin);
});

export class Plugin extends AbstractRendererPlugin {
  name = 'rough-svg-renderer';
  init(): void {
    this.container.load(containerModule, true);
  }
  destroy(): void {
    this.container.unload(containerModule);
  }
}
