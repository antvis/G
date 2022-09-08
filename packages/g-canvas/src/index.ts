import type { RendererConfig } from '@antv/g-lite';
import { AbstractRenderer } from '@antv/g-lite';
import * as CanvasPathGenerator from '@antv/g-plugin-canvas-path-generator';
import * as CanvasPicker from '@antv/g-plugin-canvas-picker';
import * as CanvasRenderer from '@antv/g-plugin-canvas-renderer';
import * as DomInteraction from '@antv/g-plugin-dom-interaction';
import * as HTMLRenderer from '@antv/g-plugin-html-renderer';
import * as ImageLoader from '@antv/g-plugin-image-loader';
import { ContextRegisterPlugin } from './ContextRegisterPlugin';

export {
  CanvasPathGenerator,
  CanvasPicker,
  CanvasRenderer,
  DomInteraction,
  HTMLRenderer,
  ImageLoader,
};

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
