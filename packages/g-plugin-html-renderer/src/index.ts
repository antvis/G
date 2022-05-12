import type { Syringe } from 'mana-syringe';
import { Module } from 'mana-syringe';
import type { RendererPlugin } from '@antv/g';
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
