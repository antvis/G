import type { RendererConfig } from '@antv/g-lite';
import { AbstractRenderer } from '@antv/g-lite';
import * as DomInteraction from '@antv/g-plugin-dom-interaction';
import * as SVGPicker from '@antv/g-plugin-svg-picker';
import * as SVGRenderer from '@antv/g-plugin-svg-renderer';
import { ContextRegisterPlugin } from './ContextRegisterPlugin';
export { DomInteraction, SVGPicker, SVGRenderer };

export class Renderer extends AbstractRenderer {
  constructor(config?: Partial<RendererConfig>) {
    super(config);

    this.registerPlugin(new ContextRegisterPlugin());
    this.registerPlugin(new SVGRenderer.Plugin());
    this.registerPlugin(new DomInteraction.Plugin());
    this.registerPlugin(new SVGPicker.Plugin());
  }
}
