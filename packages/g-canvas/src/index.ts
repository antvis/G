import { AbstractRenderer, RendererConfig } from '@antv/g';
import { Plugin as DomInteractionPlugin } from '@antv/g-plugin-dom-interaction';
import { Plugin as CanvasRendererPlugin } from '@antv/g-plugin-canvas-renderer';
import { Plugin as CanvasPickerPlugin } from '@antv/g-plugin-canvas-picker';
import { Plugin as HTMLRendererPlugin } from '@antv/g-plugin-html-renderer';
import { ContextRegisterPlugin } from './ContextRegisterPlugin';

export class Renderer extends AbstractRenderer {
  constructor(config?: Partial<RendererConfig>) {
    super(config);

    // register Canvas2DContext
    this.registerPlugin(new ContextRegisterPlugin());
    // enable rendering with Canvas2D API
    this.registerPlugin(new CanvasRendererPlugin());
    this.registerPlugin(new DomInteractionPlugin());
    // enable picking with Canvas2D API
    this.registerPlugin(new CanvasPickerPlugin());

    // render HTML component
    this.registerPlugin(new HTMLRendererPlugin());
  }
}
