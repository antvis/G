import type { RendererConfig } from '@antv/g';
import { AbstractRenderer } from '@antv/g';
import * as CanvasPathGenerator from '@antv/g-plugin-canvas-path-generator';
import * as CanvasPicker from '@antv/g-plugin-canvas-picker';
import * as CanvasRenderer from '@antv/g-plugin-canvas-renderer';
import * as ImageLoader from '@antv/g-plugin-image-loader';
import * as MobileInteraction from '@antv/g-plugin-mobile-interaction';
import { ContextRegisterPlugin } from './ContextRegisterPlugin';

export { CanvasRenderer, CanvasPicker };

export class Renderer extends AbstractRenderer {
  constructor(config?: Partial<RendererConfig>) {
    super(config);

    // register Canvas2DContext
    this.registerPlugin(new ContextRegisterPlugin());
    this.registerPlugin(new ImageLoader.Plugin());
    this.registerPlugin(new CanvasPathGenerator.Plugin());
    // enable rendering with Canvas2D API
    this.registerPlugin(new CanvasRenderer.Plugin());
    this.registerPlugin(new MobileInteraction.Plugin());
    // enable picking with Canvas2D API
    this.registerPlugin(new CanvasPicker.Plugin());
  }
}
