import { AbstractRendererPlugin, Module } from '@antv/g';
import { HTMLRenderingPlugin } from './HTMLRenderingPlugin';

const containerModule = Module((register) => {
  register(HTMLRenderingPlugin);
});

export class Plugin extends AbstractRendererPlugin {
  name = 'html-renderer';
  init(): void {
    this.container.load(containerModule, true);
  }
  destroy(): void {
    this.container.unload(containerModule);
  }
}
