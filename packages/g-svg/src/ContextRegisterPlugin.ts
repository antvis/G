import type { Syringe } from 'mana-syringe';
import { Module } from 'mana-syringe';
import type { RendererPlugin } from '@antv/g';
import { SVGContextService } from './SVGContextService';

const containerModule = Module((register) => {
  /**
   * implements ContextService
   */
  register(SVGContextService);
});

export class ContextRegisterPlugin implements RendererPlugin {
  name = 'svg-context-register';
  init(container: Syringe.Container): void {
    container.load(containerModule, true);
  }
  destroy(container: Syringe.Container): void {
    container.unload(containerModule);
  }
}
