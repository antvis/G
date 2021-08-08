import { AbstractRenderer, RendererConfig } from '@antv/g';
import { Plugin as DomInteractionPlugin } from '@antv/g-plugin-dom-interaction';
import { Plugin as CanvasRendererPlugin } from '@antv/g-plugin-canvas-renderer';
import { Plugin as CanvasPickerPlugin } from '@antv/g-plugin-canvas-picker';
import { ContextRegisterPlugin } from './ContextRegisterPlugin';

export class Renderer extends AbstractRenderer {
  constructor(config?: Partial<RendererConfig>) {
    super(config);

    this.registerPlugin(new ContextRegisterPlugin());
    this.registerPlugin(new CanvasRendererPlugin());
    this.registerPlugin(new DomInteractionPlugin());
    this.registerPlugin(new CanvasPickerPlugin());
  }
}
