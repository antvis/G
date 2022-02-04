import { AbstractRenderer, RendererConfig } from '@antv/g';
import * as DomInteraction from '@antv/g-plugin-dom-interaction';
import * as WebGLRenderer from '@antv/g-plugin-webgl-renderer';
import { ContextRegisterPlugin } from './ContextRegisterPlugin';

export { DomInteraction, WebGLRenderer };

interface WebGLRendererConfig extends RendererConfig {
  targets: ('webgl1' | 'webgl2' | 'webgpu')[];
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
    this.registerPlugin(new DomInteraction.Plugin());
  }

  getDevice() {
    return this.renderGraphPlugin.getDevice();
  }
}
