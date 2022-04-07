import type { RendererConfig } from '@antv/g';
import { AbstractRenderer } from '@antv/g';
import * as MobileInteraction from '@antv/g-plugin-mobile-interaction';
import * as JSONRenderer from '@antv/g-plugin-json-renderer';
import * as CanvasPicker from '@antv/g-plugin-canvas-picker';
import { ContextRegisterPlugin } from './ContextRegisterPlugin';

export { MobileInteraction, CanvasPicker };

export class Renderer extends AbstractRenderer {
  constructor(config?: Partial<RendererConfig>) {
    super(config);

    // register Canvas2DContext
    this.registerPlugin(new ContextRegisterPlugin());
    // enable rendering with Canvas2D API
    this.registerPlugin(new JSONRenderer.Plugin());
    this.registerPlugin(new MobileInteraction.Plugin());
    // enable picking with Canvas2D API
    this.registerPlugin(new CanvasPicker.Plugin());
  }
}
