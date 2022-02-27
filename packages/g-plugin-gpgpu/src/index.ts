import { Syringe, Module } from 'mana-syringe';
import { RendererPlugin } from '@antv/g';
import { BufferUsage } from '@antv/g-plugin-webgl-renderer';

// const containerModule = Module((register) => {
//   register(HTMLRenderingPlugin);
// });
export * from './interface';
export * from './Kernel';
export { BufferUsage };
export class Plugin implements RendererPlugin {
  init(container: Syringe.Container): void {
    // container.load(containerModule, true);
  }
  destroy(container: Syringe.Container): void {
    // @ts-ignore
    // container.container.unload(containerModule);
    // // container.unload(containerModule);
    // container.remove(HTMLRenderingPlugin);
  }
}
