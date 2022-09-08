import { AbstractRendererPlugin } from '@antv/g';

export * from './interface';
export * from './Kernel';
export class Plugin extends AbstractRendererPlugin {
  name = 'gpgpu';
  init(): void {}
  destroy(): void {}
}
