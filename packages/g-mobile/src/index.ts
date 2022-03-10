import type { RendererConfig } from '@antv/g';
import { AbstractRenderer, Circle, Rect } from '@antv/g';
import * as CanvasRenderer from '@antv/g-plugin-canvas-renderer';
import * as CanvasPicker from '@antv/g-plugin-canvas-picker';
import * as MobileInteraction from '@antv/g-plugin-mobile-interaction';
import { ContextRegisterPlugin } from './ContextRegisterPlugin';

export { CanvasRenderer, CanvasPicker };

export { default as Canvas } from './canvas';
export { Circle, Rect };

export class Renderer extends AbstractRenderer {
  constructor(config?: Partial<RendererConfig>) {
    super(config);

    // register Canvas2DContext
    this.registerPlugin(new ContextRegisterPlugin());
    // enable rendering with Canvas2D API
    this.registerPlugin(new CanvasRenderer.Plugin());
    this.registerPlugin(new MobileInteraction.Plugin());
    // enable picking with Canvas2D API
    this.registerPlugin(new CanvasPicker.Plugin());
  }
}
