import { AbstractRendererPlugin } from '@antv/g-lite';
import { Canvas2DContextService } from './Canvas2DContextService';

export class ContextRegisterPlugin extends AbstractRendererPlugin {
  name = 'mobile-canvas-context-register';
  init(): void {
    this.context.ContextService = Canvas2DContextService;
  }
  destroy(): void {
    delete this.context.ContextService;
  }
}
