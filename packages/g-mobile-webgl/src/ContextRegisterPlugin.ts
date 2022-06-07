import type { RendererPlugin, Syringe } from '@antv/g';
import { Module } from '@antv/g';
import { WebGLContextService } from './WebGLContextService';

const containerModule = Module((register) => {
  /**
   * implements ContextService
   */
  register(WebGLContextService);
});

export class ContextRegisterPlugin implements RendererPlugin {
  name = 'mobile-webgl-context-register';
  init(container: Syringe.Container): void {
    container.load(containerModule, true);
  }
  destroy(container: Syringe.Container): void {
    container.unload(containerModule);
  }
}
