import type { RendererPlugin, Syringe } from '@antv/g';

export * from './interface';
export * from './Kernel';
export class Plugin implements RendererPlugin {
  name = 'gpgpu';
  init(container: Syringe.Container): void {}
  destroy(container: Syringe.Container): void {}
}
