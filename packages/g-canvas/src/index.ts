import type { RendererConfig } from '@antv/g-lite';
import { AbstractRenderer, ImageLoader, HTMLRenderer } from '@antv/g-lite';
import * as CanvasRenderer from '@antv/g-plugin-canvas-renderer';
import * as DomInteraction from '@antv/g-plugin-dom-interaction';
import * as CanvasPicker from './plugins/picker';
import * as CanvasPathGenerator from './plugins/path-generator';
import { ContextRegisterPlugin } from './ContextRegisterPlugin';

export { CanvasRenderer, DomInteraction, HTMLRenderer, ImageLoader };

export class Renderer extends AbstractRenderer {
  constructor(config?: Partial<RendererConfig>) {
    super(config);

    // register Canvas2DContext
    this.registerPlugin(new ContextRegisterPlugin());
    this.registerPlugin(new ImageLoader.Plugin());
    this.registerPlugin(new CanvasPathGenerator.Plugin());
    // enable rendering with Canvas2D API
    this.registerPlugin(new CanvasRenderer.Plugin());
    this.registerPlugin(new DomInteraction.Plugin());
    // enable picking with Canvas2D API
    this.registerPlugin(new CanvasPicker.Plugin());

    // render HTML component
    this.registerPlugin(new HTMLRenderer.Plugin());
  }
}

// plugins
export type { PathGenerator } from './plugins/path-generator';
export { CanvasPathGenerator, CanvasPicker };
