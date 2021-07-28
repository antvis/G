import type { RendererConfig } from '@antv/g';
import { AbstractRenderer, ContextService } from '@antv/g';
import { ContainerModule } from 'inversify';
import { containerModule as domInteractionModule } from '@antv/g-plugin-dom-interaction';
import { containerModule as canvasRendererModule } from '@antv/g-plugin-canvas-renderer';
import { containerModule as canvasPickerModule } from '@antv/g-plugin-canvas-picker';
import { CanvasKitContextService } from './CanvasKitContextService';

export class CanvasKitRenderer extends AbstractRenderer {
  constructor(config?: Partial<RendererConfig>) {
    super(config);

    this.registerPlugin(
      new ContainerModule((bind, unbind, isBound, rebind) => {
        /**
         * implements ContextService
         */
        bind(CanvasKitContextService).toSelf().inSingletonScope();
        bind(ContextService).toService(CanvasKitContextService);
      }),
    );

    this.registerPlugin(canvasRendererModule);
    this.registerPlugin(domInteractionModule);
    this.registerPlugin(canvasPickerModule);
  }

  static async ready() {
    await CanvasKitContextService.ready();
  }
}
