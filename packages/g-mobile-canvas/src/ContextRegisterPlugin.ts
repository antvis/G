import type { Syringe } from 'mana-syringe';
import { Module } from 'mana-syringe';
import type { RendererPlugin } from '@antv/g';
import { Canvas2DContextService } from './Canvas2DContextService';

const containerModule = Module((register) => {
  /**
   * implements ContextService
   */
  register(Canvas2DContextService);
});

export class ContextRegisterPlugin implements RendererPlugin {
  name = 'mobile-canvas-context-register';
  init(container: Syringe.Container): void {
    container.load(containerModule, true);
  }
  destroy(container: Syringe.Container): void {
    container.unload(containerModule);
  }
}
