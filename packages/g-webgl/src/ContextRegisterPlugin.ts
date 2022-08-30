import { AbstractRendererPlugin, ContextService } from '@antv/g-lite';
import type * as DeviceRenderer from '@antv/g-plugin-device-renderer';
import { DeviceRendererPlugin } from './tokens';
import { WebGLContextService } from './WebGLContextService';

// const containerModule = Module((register) => {
//   /**
//    * implements ContextService
//    */
//   register(WebGLContextService);
// });

export class ContextRegisterPlugin extends AbstractRendererPlugin {
  name = 'webgl-context-register';

  constructor(private rendererPlugin: DeviceRenderer.Plugin) {
    super();
  }

  init(): void {
    this.container.register(DeviceRendererPlugin, {
      useValue: this.rendererPlugin,
    });

    this.container.registerSingleton(ContextService, WebGLContextService);
    // this.container.load(containerModule, true);
  }
  destroy(): void {
    // this.container.unload(containerModule);
    // this.container.remove(DeviceRendererPlugin);
  }
}
