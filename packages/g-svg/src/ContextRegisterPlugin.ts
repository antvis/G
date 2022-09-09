import { AbstractRendererPlugin, Module } from '@antv/g-lite';
import { SVGContextService } from './SVGContextService';

const containerModule = Module((register) => {
  /**
   * implements ContextService
   */
  register(SVGContextService);
});

export class ContextRegisterPlugin extends AbstractRendererPlugin {
  name = 'svg-context-register';
  init(): void {
    this.container.load(containerModule, true);
  }
  destroy(): void {
    this.container.unload(containerModule);
  }
}
