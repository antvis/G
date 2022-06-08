import type { RendererPlugin, Syringe } from '@antv/g';
import { Module } from '@antv/g';
import { RoughCreateElementContribution } from './RoughCreateElementContribution';
import { RoughRendererPlugin } from './RoughRendererPlugin';

const containerModule = Module((register) => {
  register(RoughCreateElementContribution);
  register(RoughRendererPlugin);
});

export class Plugin implements RendererPlugin {
  name = 'rough-svg-renderer';
  init(container: Syringe.Container): void {
    container.load(containerModule, true);
  }
  destroy(container: Syringe.Container): void {
    container.unload(containerModule);
  }
}
