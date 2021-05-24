import { AbstractRenderer, RendererConfig, ContextService } from '@antv/g';
import { ContainerModule } from 'inversify';
import { containerModule as domInteractionModule } from '@antv/g-plugin-dom-interaction';
import { containerModule as canvasRendererModule } from '@antv/g-plugin-canvas-renderer';
import { containerModule as canvasPickerModule } from '@antv/g-plugin-canvas-picker';
import { Canvas2DContextService } from './Canvas2DContextService';

export class Renderer extends AbstractRenderer {
  constructor(config: RendererConfig) {
    super(config);

    this.registerPlugin(
      new ContainerModule((bind, unbind, isBound, rebind) => {
        /**
         * implements ContextService
         */
        bind(Canvas2DContextService).toSelf().inSingletonScope();
        bind(ContextService).toService(Canvas2DContextService);
      })
    );

    this.registerPlugin(canvasRendererModule);
    this.registerPlugin(domInteractionModule);
    this.registerPlugin(canvasPickerModule);
  }
}
