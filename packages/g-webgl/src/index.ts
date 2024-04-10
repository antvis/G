import type { RendererConfig } from '@antv/g-lite';
import { AbstractRenderer } from '@antv/g-lite';
import * as DeviceRenderer from '@antv/g-plugin-device-renderer';
import * as DomInteraction from '@antv/g-plugin-dom-interaction';
import * as HTMLRenderer from '@antv/g-plugin-html-renderer';
import * as ImageLoader from '@antv/g-plugin-image-loader';
import { ContextRegisterPlugin } from './ContextRegisterPlugin';
import { WebXRManager } from './WebXRManager';

export { DomInteraction, DeviceRenderer, HTMLRenderer };
export { ARButton } from './ARButton';
export { WebXRManager } from './WebXRManager';

export interface WebGLRendererConfig extends RendererConfig {
  targets: ('webgl1' | 'webgl2')[];
  onContextLost: (e: Event) => void;
  onContextRestored: (e: Event) => void;
  onContextCreationError: (e: Event) => void;
  enableFXAA: boolean;
}

export class Renderer extends AbstractRenderer {
  xr: WebXRManager;

  constructor(config?: Partial<WebGLRendererConfig>) {
    super({
      enableSizeAttenuation: false,
      ...config,
    });

    const deviceRendererPlugin = new DeviceRenderer.Plugin(config);
    this.xr = new WebXRManager(deviceRendererPlugin);

    this.registerPlugin(
      new ContextRegisterPlugin(deviceRendererPlugin, config),
    );
    this.registerPlugin(new ImageLoader.Plugin());
    this.registerPlugin(deviceRendererPlugin);
    this.registerPlugin(new DomInteraction.Plugin());
    this.registerPlugin(new HTMLRenderer.Plugin());
  }
}
