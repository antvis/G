import type { Syringe } from 'mana-syringe';
import type { RendererPlugin } from '@antv/g';
import { BufferUsage } from '@antv/g-plugin-device-renderer';

export * from './interface';
export * from './Kernel';
export { BufferUsage };
export class Plugin implements RendererPlugin {
  name = 'gpgpu';
  init(container: Syringe.Container): void {}
  destroy(container: Syringe.Container): void {}
}
