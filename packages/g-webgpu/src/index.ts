import {
  AbstractRenderer,
  ClipSpaceNearZ,
  RendererConfig,
  ImageLoader,
  HTMLRenderer,
} from '@antv/g-lite';
import * as DeviceRenderer from '@antv/g-plugin-device-renderer';
import * as DomInteraction from '@antv/g-plugin-dom-interaction';
import { ContextRegisterPlugin } from './ContextRegisterPlugin';

export { DomInteraction, DeviceRenderer, HTMLRenderer };

export interface WebGPURendererConfig extends RendererConfig {
  shaderCompilerPath: string;
  onContextLost: () => void;
}

export class Renderer extends AbstractRenderer {
  clipSpaceNearZ = ClipSpaceNearZ.ZERO;

  constructor(config?: Partial<WebGPURendererConfig>) {
    super({
      enableSizeAttenuation: false,
      ...config,
    });

    const deviceRendererPlugin = new DeviceRenderer.Plugin();
    this.registerPlugin(
      new ContextRegisterPlugin(deviceRendererPlugin, config),
    );
    this.registerPlugin(new ImageLoader.Plugin());
    this.registerPlugin(deviceRendererPlugin);
    this.registerPlugin(new DomInteraction.Plugin());
    this.registerPlugin(new HTMLRenderer.Plugin());
  }
}
