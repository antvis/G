import type { RendererConfig } from '@antv/g-lite';
import { AbstractRenderer } from '@antv/g-lite';
import * as DeviceRenderer from '@antv/g-plugin-device-renderer';
import * as DomInteraction from '@antv/g-plugin-dom-interaction';
import * as HTMLRenderer from '@antv/g-plugin-html-renderer';
import * as ImageLoader from '@antv/g-plugin-image-loader';
import * as WebGLDevice from '@antv/g-plugin-webgl-device';
import { ContextRegisterPlugin } from './ContextRegisterPlugin';

export { DomInteraction, DeviceRenderer, WebGLDevice, HTMLRenderer };

interface WebGLRendererConfig extends RendererConfig {
  targets: ('webgl1' | 'webgl2')[];
  onContextLost: (e: Event) => void;
  onContextRestored: (e: Event) => void;
  onContextCreationError: (e: Event) => void;
  enableFXAA: boolean;
}

export class Renderer extends AbstractRenderer {
  constructor(config?: Partial<WebGLRendererConfig>) {
    super(config);

    const deviceRendererPlugin = new DeviceRenderer.Plugin(config);

    this.registerPlugin(new ContextRegisterPlugin(deviceRendererPlugin));
    this.registerPlugin(new ImageLoader.Plugin());
    this.registerPlugin(
      new WebGLDevice.Plugin({
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
      }),
    );
    this.registerPlugin(deviceRendererPlugin);
    this.registerPlugin(new DomInteraction.Plugin());
    this.registerPlugin(new HTMLRenderer.Plugin());
  }
}
