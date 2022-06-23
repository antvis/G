import type { RendererPlugin, Syringe } from '@antv/g';
import { Module } from '@antv/g';
import * as DeviceRenderer from '@antv/g-plugin-device-renderer';
import { DeviceRendererPlugin } from './tokens';
import { WebGLContextService } from './WebGLContextService';

const containerModule = Module((register) => {
  /**
   * implements ContextService
   */
  register(WebGLContextService);
});

export class ContextRegisterPlugin implements RendererPlugin {
  name = 'mobile-webgl-context-register';

  constructor(private rendererPlugin: DeviceRenderer.Plugin) {}

  init(container: Syringe.Container): void {
    container.register(DeviceRendererPlugin, {
      useValue: this.rendererPlugin,
    });
    container.load(containerModule, true);
  }
  destroy(container: Syringe.Container): void {
    container.unload(containerModule);
    container.remove(DeviceRendererPlugin);
  }
}
