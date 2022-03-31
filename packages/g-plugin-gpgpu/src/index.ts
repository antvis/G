import type { Syringe } from 'mana-syringe';
import type { RendererPlugin } from '@antv/g';
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
    // container.unload(containerModule);
  }
}
