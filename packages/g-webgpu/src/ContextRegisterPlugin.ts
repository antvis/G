import type { RendererPlugin, Syringe } from '@antv/g';
import { Module } from '@antv/g';
import type * as DeviceRenderer from '@antv/g-plugin-device-renderer';
import { DeviceRendererPlugin } from './tokens';
import { WebGPUContextService } from './WebGPUContextService';

const containerModule = Module((register) => {
  /**
   * implements ContextService
   */
  register(WebGPUContextService);
});

export class ContextRegisterPlugin implements RendererPlugin {
  name = 'webgpu-context-register';
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
