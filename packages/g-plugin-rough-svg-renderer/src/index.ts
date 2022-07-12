import { AbstractRendererPlugin, Module } from '@antv/g';
import { RoughCreateElementContribution } from './RoughCreateElementContribution';
import { RoughRendererPlugin } from './RoughRendererPlugin';

const containerModule = Module((register) => {
  register(RoughCreateElementContribution);
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
