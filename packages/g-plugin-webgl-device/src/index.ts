import { AbstractRendererPlugin } from '@antv/g-lite';
import { DeviceContribution } from '@antv/g-plugin-device-renderer';
import { WebGLRendererPluginOptions } from './interfaces';
import { WebGLDeviceContribution } from './WebGLDeviceContribution';

// const containerModule = Module((register) => {
//   register(WebGLDeviceContribution);
// });

export class Plugin extends AbstractRendererPlugin {
  name = 'webgl-device';
  constructor(private options: Partial<WebGLRendererPluginOptions>) {
    super();
  }

  init(): void {
    this.container.register(WebGLRendererPluginOptions, {
      useValue: {
        ...this.options,
      },
    });

    this.container.registerSingleton(DeviceContribution, WebGLDeviceContribution);
    // this.container.load(containerModule, true);
  }
  destroy(): void {
    // this.container.remove(WebGLRendererPluginOptions);
    // this.container.unload(containerModule);
  }
}
