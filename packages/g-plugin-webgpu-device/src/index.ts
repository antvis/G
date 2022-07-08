import { AbstractRendererPlugin, Module } from '@antv/g';
import { WebGPUDeviceOptions } from './interfaces';
import { WebGPUDeviceContribution } from './WebGPUDeviceContribution';

const containerModule = Module((register) => {
  register(WebGPUDeviceContribution);
});

export class Plugin extends AbstractRendererPlugin {
  name = 'webgpu-device';
  constructor(private options: Partial<WebGPUDeviceOptions> = {}) {
    super();
  }

  init(): void {
    this.container.register(WebGPUDeviceOptions, {
      useValue: {
        ...this.options,
      },
    });
    this.container.load(containerModule, true);
  }
  destroy(): void {
    this.container.remove(WebGPUDeviceOptions);
    this.container.unload(containerModule);
  }
}
