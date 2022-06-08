import type { RendererPlugin, Syringe } from '@antv/g';
import { Module } from '@antv/g';
import { MobileInteractionPlugin } from './MobileInteractionPlugin';

const containerModule = Module((register) => {
  register(MobileInteractionPlugin);
});

export class Plugin implements RendererPlugin {
  name = 'mobile-interaction';
  init(container: Syringe.Container): void {
    container.load(containerModule, true);
  }
  destroy(container: Syringe.Container): void {
    container.unload(containerModule);
  }
}
