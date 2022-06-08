import type { RendererPlugin, Syringe } from '@antv/g';
import { Module } from '@antv/g';
import { WebGPUDeviceOptions } from './interfaces';
import { WebGPUDeviceContribution } from './WebGPUDeviceContribution';

const containerModule = Module((register) => {
  register(WebGPUDeviceContribution);
});

export class Plugin implements RendererPlugin {
  name = 'webgpu-device';
  constructor(private options: Partial<WebGPUDeviceOptions> = {}) {}

  init(container: Syringe.Container): void {
    container.register(WebGPUDeviceOptions, {
      useValue: {
        ...this.options,
      },
    });
    container.load(containerModule, true);
  }
  destroy(container: Syringe.Container): void {
    container.remove(WebGPUDeviceOptions);
    container.unload(containerModule);
  }
}
