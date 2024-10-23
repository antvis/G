import { AbstractRendererPlugin } from '@antv/g-lite';
import type * as DeviceRenderer from '@antv/g-plugin-device-renderer';
import { WebGLDeviceContribution } from '@antv/g-device-api';
import { WebGLContextService } from './WebGLContextService';
import { WebGLRendererConfig } from '.';

export class ContextRegisterPlugin extends AbstractRendererPlugin {
  name = 'webgl-context-register';

  constructor(
    private rendererPlugin: DeviceRenderer.Plugin,
    private config: Partial<WebGLRendererConfig>,
  ) {
    super();
  }

  init(): void {
    this.context.ContextService = WebGLContextService;
    this.context.deviceRendererPlugin = this.rendererPlugin;
    const { config } = this;
    this.context.deviceContribution = new WebGLDeviceContribution({
      ...(config?.targets
        ? {
            targets: config.targets,
          }
        : {
            targets: ['webgl2', 'webgl1'],
          }),
      onContextLost: config?.onContextLost,
      onContextRestored: config?.onContextRestored,
      onContextCreationError: config?.onContextCreationError,
    });
  }
  destroy(): void {
    delete this.context.ContextService;
  }
}
