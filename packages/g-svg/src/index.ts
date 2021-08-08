import { AbstractRenderer, RendererConfig } from '@antv/g';
import { Plugin as DomInteractionPlugin } from '@antv/g-plugin-dom-interaction';
import { Plugin as SvgRendererPlugin } from '@antv/g-plugin-svg-renderer';
import { Plugin as SvgPickerPlugin } from '@antv/g-plugin-svg-picker';
import { ContextRegisterPlugin } from './ContextRegisterPlugin';

export class Renderer extends AbstractRenderer {
  constructor(config: RendererConfig) {
    super(config);

    this.registerPlugin(new ContextRegisterPlugin());
    this.registerPlugin(new SvgRendererPlugin());
    this.registerPlugin(new DomInteractionPlugin());
    this.registerPlugin(new SvgPickerPlugin());
  }
}
