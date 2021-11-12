import { Syringe, Module } from 'mana-syringe';
import { ContextService, RendererPlugin } from '@antv/g';
import { WebGLContextService } from './WebGLContextService';

const containerModule = Module((register) => {
  /**
   * implements ContextService
   */
  register(WebGLContextService);
});

export class ContextRegisterPlugin implements RendererPlugin {
  init(container: Syringe.Container): void {
    container.load(containerModule, true);
  }
  destroy(container: Syringe.Container): void {
    container.remove(WebGLContextService);
    // @ts-ignore
    // container.container.unload(containerModule);
    // container.unload(containerModule);
  }
}
