import { AbstractRendererPlugin } from '@antv/g-lite';
import { SVGContextService } from './SVGContextService';

export class ContextRegisterPlugin extends AbstractRendererPlugin {
  name = 'mobile-svg-context-register';
  init(): void {
    // @ts-ignore
    this.context.ContextService = SVGContextService;
  }
  destroy(): void {
    delete this.context.ContextService;
  }
}
