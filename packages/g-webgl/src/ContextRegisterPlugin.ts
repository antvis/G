import { AbstractRendererPlugin } from '@antv/g-lite';
import type * as DeviceRenderer from '@antv/g-plugin-device-renderer';
import { WebGLContextService } from './WebGLContextService';
import { WebGLDeviceContribution } from '@strawberry-vis/g-device-api';
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
    const config = this.config;
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
