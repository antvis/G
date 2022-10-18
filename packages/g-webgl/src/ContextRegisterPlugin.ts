import { AbstractRendererPlugin } from '@antv/g-lite';
import type * as DeviceRenderer from '@antv/g-plugin-device-renderer';
import { WebGLContextService } from './WebGLContextService';

export class ContextRegisterPlugin extends AbstractRendererPlugin {
  name = 'webgl-context-register';

  constructor(private rendererPlugin: DeviceRenderer.Plugin) {
    super();
  }

  init(): void {
    this.context.ContextService = WebGLContextService;
    // @ts-ignore
    this.context.deviceRendererPlugin = this.rendererPlugin;
  }
  destroy(): void {
    delete this.context.ContextService;
  }
}
