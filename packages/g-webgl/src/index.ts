import type { RendererConfig } from '@antv/g';
import { AbstractRenderer } from '@antv/g';
import * as DomInteraction from '@antv/g-plugin-dom-interaction';
import * as WebGLRenderer from '@antv/g-plugin-webgl-renderer';
import type { Texture, TextureDescriptor } from '@antv/g-plugin-webgl-renderer';
import { ContextRegisterPlugin } from './ContextRegisterPlugin';

export { DomInteraction, WebGLRenderer };

interface WebGLRendererConfig extends RendererConfig {
  targets: ('webgl1' | 'webgl2' | 'webgpu')[];
  plugins: {
    enableDOMInteraction: boolean;
  };
}

export class Renderer extends AbstractRenderer {
  private renderGraphPlugin: WebGLRenderer.Plugin;

  constructor(config?: Partial<WebGLRendererConfig>) {
    super(config);

    this.registerPlugin(new ContextRegisterPlugin());
    this.renderGraphPlugin = new WebGLRenderer.Plugin(
      config?.targets
        ? {
            targets: config.targets,
          }
        : {},
    );
    this.registerPlugin(this.renderGraphPlugin);

    if (config?.plugins?.enableDOMInteraction !== false) {
      this.registerPlugin(new DomInteraction.Plugin());
    }
  }

  getDevice() {
    return this.renderGraphPlugin.getDevice();
  }

  loadTexture(
    src: string | TexImageSource,
    descriptor?: TextureDescriptor,
    successCallback?: (t: Texture) => void,
  ) {
    return this.renderGraphPlugin.loadTexture(src, descriptor, successCallback);
  }
}
