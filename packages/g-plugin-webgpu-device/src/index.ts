import { AbstractRendererPlugin } from '@antv/g-lite';
import type { WebGPUDeviceOptions } from './interfaces';
import { WebGPUDeviceContribution } from './WebGPUDeviceContribution';
export class Plugin extends AbstractRendererPlugin {
  name = 'webgpu-device';
  constructor(private options: Partial<WebGPUDeviceOptions> = {}) {
    super();
  }

  init(): void {
    // @ts-ignore
    this.context.deviceContribution = new WebGPUDeviceContribution({
      ...this.options,
    });
  }
  destroy(): void {
    // @ts-ignore
    delete this.context.deviceContribution;
  }
}
