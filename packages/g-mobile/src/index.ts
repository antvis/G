import type { RendererConfig } from '@antv/g';
import { AbstractRenderer } from '@antv/g';
import * as CanvasRenderer from '@antv/g-plugin-canvas-renderer';
import * as CanvasPicker from '@antv/g-plugin-canvas-picker';
import { ContextRegisterPlugin } from './ContextRegisterPlugin';

export { CanvasRenderer, CanvasPicker };

export class Renderer extends AbstractRenderer {
  constructor(config?: Partial<RendererConfig>) {
    super(config);

    // register Canvas2DContext
    this.registerPlugin(new ContextRegisterPlugin());
    // enable rendering with Canvas2D API
    this.registerPlugin(new CanvasRenderer.Plugin());
    // enable picking with Canvas2D API
    this.registerPlugin(new CanvasPicker.Plugin());
  }
}
