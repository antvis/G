import { Syringe, Module } from 'mana-syringe';
import { RendererPlugin } from '@antv/g';
import { SVGContextService } from './SVGContextService';

const containerModule = Module((register) => {
  /**
   * implements ContextService
   */
  register(SVGContextService);
});

export class ContextRegisterPlugin implements RendererPlugin {
  init(container: Syringe.Container): void {
    container.load(containerModule, true);
  }
  destroy(container: Syringe.Container): void {
    container.remove(SVGContextService);
    // @ts-ignore
    // container.container.unload(containerModule);
    // container.unload(containerModule);
  }
}
