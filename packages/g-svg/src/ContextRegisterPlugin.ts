import { Syringe, Module } from 'mana-syringe';
import { ContextService, RendererPlugin } from '@antv/g';
import { SVGContextService } from './SVGContextService';

const containerModule = Module((register) => {
  /**
   * implements ContextService
   */
  register(SVGContextService);
});

export class ContextRegisterPlugin implements RendererPlugin {
  init(container: Syringe.Container): void {
    container.load(containerModule);
  }
  destroy(container: Syringe.Container): void {
    // @ts-ignore
    // container.container.unload(containerModule);
    // container.unload(containerModule);
  }
}
