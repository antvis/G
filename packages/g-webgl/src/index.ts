import { AbstractRenderer, RendererConfig } from '@antv/g';
import * as DomInteraction from '@antv/g-plugin-dom-interaction';
import * as WebGLRenderer from '@antv/g-plugin-webgl-renderer';
import { ContextRegisterPlugin } from './ContextRegisterPlugin';

export { DomInteraction, WebGLRenderer };

export class Renderer extends AbstractRenderer {
  constructor(config?: Partial<RendererConfig>) {
    super(config);

    this.registerPlugin(new ContextRegisterPlugin());
    this.registerPlugin(new WebGLRenderer.Plugin());
    this.registerPlugin(new DomInteraction.Plugin());
  }
}

export * from './gpgpu';
