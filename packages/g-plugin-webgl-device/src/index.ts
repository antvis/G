import { AbstractRendererPlugin } from '@antv/g-lite';
import type { WebGLRendererPluginOptions } from './interfaces';
import { WebGLDeviceContribution } from './WebGLDeviceContribution';

export { WebGLDeviceContribution };

export class Plugin extends AbstractRendererPlugin {
  name = 'webgl-device';
  constructor(private options: Partial<WebGLRendererPluginOptions>) {
    super();
  }

  init(): void {
    // @ts-ignore
    this.context.deviceContribution = new WebGLDeviceContribution({
      ...this.options,
    });
  }
  destroy(): void {
    // @ts-ignore
    delete this.context.deviceContribution;
  }
}
