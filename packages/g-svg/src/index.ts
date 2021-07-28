import type { RendererConfig } from '@antv/g';
import { AbstractRenderer, ContextService } from '@antv/g';
import { ContainerModule } from 'inversify';
import { containerModule as domInteractionModule } from '@antv/g-plugin-dom-interaction';
import { containerModule as svgRendererModule } from '@antv/g-plugin-svg-renderer';
import { containerModule as svgPickerModule } from '@antv/g-plugin-svg-picker';
import { SVGContextService } from './SVGContextService';

export class Renderer extends AbstractRenderer {
  constructor(config: RendererConfig) {
    super(config);

    this.registerPlugin(
      new ContainerModule((bind, unbind, isBound, rebind) => {
        /**
         * implements ContextService
         */
        bind(SVGContextService).toSelf().inSingletonScope();
        bind(ContextService).toService(SVGContextService);
      }),
    );
    this.registerPlugin(svgRendererModule);
    this.registerPlugin(domInteractionModule);
    this.registerPlugin(svgPickerModule);
  }
}
