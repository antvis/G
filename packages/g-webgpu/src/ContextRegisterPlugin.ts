import { AbstractRendererPlugin } from '@antv/g-lite';
import type * as DeviceRenderer from '@antv/g-plugin-device-renderer';
import { WebGPUContextService } from './WebGPUContextService';

export class ContextRegisterPlugin extends AbstractRendererPlugin {
  name = 'webgpu-context-register';
  constructor(private rendererPlugin: DeviceRenderer.Plugin) {
    super();
  }

  init(): void {
    this.context.ContextService = WebGPUContextService;
    // @ts-ignore
    this.context.deviceRendererPlugin = this.rendererPlugin;
  }
  destroy(): void {
    delete this.context.ContextService;
  }
}
