import type { RendererConfig } from '@antv/g-lite';
import { AbstractRenderer } from '@antv/g-lite';
import * as DomInteraction from '@antv/g-plugin-dom-interaction';
import * as SVGPicker from '@antv/g-plugin-svg-picker';
import * as SVGRenderer from '@antv/g-plugin-svg-renderer';
import { ContextRegisterPlugin } from './ContextRegisterPlugin';

export { DomInteraction, SVGPicker, SVGRenderer };

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
