import type { RendererConfig } from '@antv/g-lite';
import { AbstractRenderer, DomInteraction } from '@antv/g-lite';
import * as SVGRenderer from './plugins/svg-renderer';
import * as SVGPicker from './plugins/picker';
import { ContextRegisterPlugin } from './ContextRegisterPlugin';

export interface SVGRendererConfig extends RendererConfig {
  /**
   * Whether to output id on SVGElement with `setAttribute` like: <circle id="g-circle-123">.
   */
  outputSVGElementId: boolean;
}

export class Renderer extends AbstractRenderer {
  constructor(config: Partial<SVGRendererConfig> = {}) {
    super(config);

    this.registerPlugin(new ContextRegisterPlugin());
    this.registerPlugin(
      new SVGRenderer.Plugin({
        outputSVGElementId: config.outputSVGElementId,
      }),
    );
    this.registerPlugin(new DomInteraction.Plugin());
    this.registerPlugin(new SVGPicker.Plugin());
  }
}

// plugins
export { createSVGElement, G_SVG_PREFIX } from './plugins/svg-renderer';
export { SVGRenderer, SVGPicker };
export { DomInteraction };
