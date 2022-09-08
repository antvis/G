import { AbstractRendererPlugin, Module } from '@antv/g';
import { Canvas2DContextService } from './Canvas2DContextService';

const containerModule = Module((register) => {
  /**
   * implements ContextService
   */
  register(Canvas2DContextService);
});

export class ContextRegisterPlugin extends AbstractRendererPlugin {
  name = 'canvas-context-register';
  init(): void {
    this.container.load(containerModule, true);
  }
  destroy(): void {
    this.container.unload(containerModule);
  }
}
