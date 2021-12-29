import type { RendererConfig } from '@antv/g';
import { AbstractRenderer } from '@antv/g';
import * as DomInteraction from '@antv/g-plugin-dom-interaction';
import * as CanvasRenderer from '@antv/g-plugin-canvas-renderer';
import * as CanvasPicker from '@antv/g-plugin-canvas-picker';
import * as HTMLRenderer from '@antv/g-plugin-html-renderer';
import { ContextRegisterPlugin } from './ContextRegisterPlugin';

export { DomInteraction, CanvasRenderer, CanvasPicker, HTMLRenderer };

export class Renderer extends AbstractRenderer {
  constructor(config?: Partial<RendererConfig>) {
    super(config);

    // register Canvas2DContext
    this.registerPlugin(new ContextRegisterPlugin());
    // enable rendering with Canvas2D API
    this.registerPlugin(new CanvasRenderer.Plugin());
    this.registerPlugin(new DomInteraction.Plugin());
    // enable picking with Canvas2D API
    this.registerPlugin(new CanvasPicker.Plugin());

    // render HTML component
    this.registerPlugin(new HTMLRenderer.Plugin());
  }
}
