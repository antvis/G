import { Module, Syringe } from 'mana-syringe';
import { RendererPlugin } from '@antv/g';
import { Canvas2DContextService } from './Canvas2DContextService';

const containerModule = Module((register) => {
  /**
   * implements ContextService
   */
  register(Canvas2DContextService);
});

export class ContextRegisterPlugin implements RendererPlugin {
  init(container: Syringe.Container): void {
    container.load(containerModule);
  }
  destroy(container: Syringe.Container): void {
    // @ts-ignore
    // container.container.unload(containerModule);
    // container.remove(Canvas2DContextService);
  }
}
