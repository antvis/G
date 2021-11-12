import { AbstractRenderer, RendererConfig } from '@antv/g';
import * as DomInteraction from '@antv/g-plugin-dom-interaction';
import * as SVGRenderer from '@antv/g-plugin-svg-renderer';
import * as SVGPicker from '@antv/g-plugin-svg-picker';
import { ContextRegisterPlugin } from './ContextRegisterPlugin';

export { DomInteraction, SVGRenderer, SVGPicker };

export class Renderer extends AbstractRenderer {
  constructor(config?: Partial<RendererConfig>) {
    super(config);

    this.registerPlugin(new ContextRegisterPlugin());
    this.registerPlugin(new SVGRenderer.Plugin());
    this.registerPlugin(new DomInteraction.Plugin());
    this.registerPlugin(new SVGPicker.Plugin());
  }
}
