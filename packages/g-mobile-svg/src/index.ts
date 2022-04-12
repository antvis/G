import type { RendererConfig } from '@antv/g';
import { AbstractRenderer } from '@antv/g';
import * as MobileInteraction from '@antv/g-plugin-mobile-interaction';
import * as SVGRenderer from '@antv/g-plugin-svg-renderer';
import * as SVGPicker from '@antv/g-plugin-svg-picker';
import { ContextRegisterPlugin } from './ContextRegisterPlugin';

export { MobileInteraction, SVGRenderer, SVGPicker };

export class Renderer extends AbstractRenderer {
  constructor(config?: Partial<RendererConfig>) {
    super(config);

    this.registerPlugin(new ContextRegisterPlugin());
    this.registerPlugin(new SVGRenderer.Plugin());
    this.registerPlugin(new MobileInteraction.Plugin());
    this.registerPlugin(new SVGPicker.Plugin());
  }
}
