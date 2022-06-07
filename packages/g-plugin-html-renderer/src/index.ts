import type { RendererPlugin, Syringe } from '@antv/g';
import { Module } from '@antv/g';
import { HTMLRenderingPlugin } from './HTMLRenderingPlugin';

const containerModule = Module((register) => {
  register(HTMLRenderingPlugin);
});

export class Plugin implements RendererPlugin {
  name = 'html-renderer';
  init(container: Syringe.Container): void {
    container.load(containerModule, true);
  }
  destroy(container: Syringe.Container): void {
    container.unload(containerModule);
  }
}
