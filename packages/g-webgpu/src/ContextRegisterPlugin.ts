import { AbstractRendererPlugin, ContextService } from '@antv/g-lite';
import type * as DeviceRenderer from '@antv/g-plugin-device-renderer';
import { DeviceRendererPlugin } from './tokens';
import { WebGPUContextService } from './WebGPUContextService';

// const containerModule = Module((register) => {
//   /**
//    * implements ContextService
//    */
//   register(WebGPUContextService);
// });

export class ContextRegisterPlugin extends AbstractRendererPlugin {
  name = 'webgpu-context-register';
  constructor(private rendererPlugin: DeviceRenderer.Plugin) {
    super();
  }

  init(): void {
    this.container.register(DeviceRendererPlugin, {
      useValue: this.rendererPlugin,
    });

    this.container.registerSingleton(ContextService, WebGPUContextService);
    // this.container.load(containerModule, true);
  }
  destroy(): void {
    // this.container.unload(containerModule);
    // this.container.remove(DeviceRendererPlugin);
  }
}
