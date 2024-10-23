import { AbstractRendererPlugin } from '@antv/g-lite';
import type * as DeviceRenderer from '@antv/g-plugin-device-renderer';
import { WebGPUDeviceContribution } from '@antv/g-device-api';
import { WebGPUContextService } from './WebGPUContextService';
import { WebGPURendererConfig } from '.';

export class ContextRegisterPlugin extends AbstractRendererPlugin {
  name = 'webgpu-context-register';
  constructor(
    private rendererPlugin: DeviceRenderer.Plugin,
    private config: Partial<WebGPURendererConfig>,
  ) {
    super();
  }

  init(): void {
    this.context.ContextService = WebGPUContextService;
    this.context.deviceRendererPlugin = this.rendererPlugin;
    const { config } = this;
    this.context.deviceContribution = new WebGPUDeviceContribution({
      shaderCompilerPath: config?.shaderCompilerPath,
      onContextLost: config?.onContextLost,
    });
  }
  destroy(): void {
    delete this.context.ContextService;
  }
}
