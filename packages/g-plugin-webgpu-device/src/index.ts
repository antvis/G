import { AbstractRendererPlugin } from '@antv/g-lite';
import { DeviceContribution } from '@antv/g-plugin-device-renderer';
import { WebGPUDeviceOptions } from './interfaces';
import { WebGPUDeviceContribution } from './WebGPUDeviceContribution';

// const containerModule = Module((register) => {
//   register(WebGPUDeviceContribution);
// });

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
    // this.container.load(containerModule, true);

    this.container.registerSingleton(DeviceContribution, WebGPUDeviceContribution);
  }
  destroy(): void {
    // this.container.remove(WebGPUDeviceOptions);
    // this.container.unload(containerModule);
  }
}
