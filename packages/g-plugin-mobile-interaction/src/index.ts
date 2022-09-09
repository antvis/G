import { AbstractRendererPlugin, Module } from '@antv/g-lite';
import { MobileInteractionPlugin } from './MobileInteractionPlugin';

const containerModule = Module((register) => {
  register(MobileInteractionPlugin);
});

export class Plugin extends AbstractRendererPlugin {
  name = 'mobile-interaction';
  init(): void {
    this.container.load(containerModule, true);
  }
  destroy(): void {
    this.container.unload(containerModule);
  }
}
