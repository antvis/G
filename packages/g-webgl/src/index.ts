import { AbstractRenderer, RendererConfig } from '@antv/g';
import { Plugin as DomInteractionPlugin } from '@antv/g-plugin-dom-interaction';
import { Plugin as WebglRendererPlugin } from '@antv/g-plugin-webgl-renderer';
import { ContextRegisterPlugin } from './ContextRegisterPlugin';

export class Renderer extends AbstractRenderer {
  constructor(config: RendererConfig) {
    super(config);

    this.registerPlugin(new ContextRegisterPlugin());
    this.registerPlugin(new WebglRendererPlugin());
    this.registerPlugin(new DomInteractionPlugin());
  }
}
