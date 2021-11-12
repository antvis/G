import { Syringe, Module } from 'mana-syringe';
import { RendererPlugin } from '@antv/g';
import { HTMLRenderingPlugin } from './HTMLRenderingPlugin';

const containerModule = Module((register) => {
  register(HTMLRenderingPlugin);
});

export class Plugin implements RendererPlugin {
  init(container: Syringe.Container): void {
    container.load(containerModule, true);
  }
  destroy(container: Syringe.Container): void {
    // @ts-ignore
    // container.container.unload(containerModule);
    // // container.unload(containerModule);
    container.remove(HTMLRenderingPlugin);
  }
}
