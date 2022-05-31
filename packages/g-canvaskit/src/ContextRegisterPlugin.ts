import type { RendererPlugin } from '@antv/g';
import type { Syringe } from 'mana-syringe';
import { Module } from 'mana-syringe';
import { CanvasKitContextService } from './CanvasKitContextService';

const containerModule = Module((register) => {
  /**
   * implements ContextService
   */
  register(CanvasKitContextService);
});

export class ContextRegisterPlugin implements RendererPlugin {
  name = 'canvaskit-context-register';
  init(container: Syringe.Container): void {
    container.load(containerModule, true);
  }
  destroy(container: Syringe.Container): void {
    container.unload(containerModule);
  }
}
