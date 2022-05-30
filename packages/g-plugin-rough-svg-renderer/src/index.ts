import type { RendererPlugin } from '@antv/g';
import type { Syringe } from 'mana-syringe';
import { Module } from 'mana-syringe';
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
