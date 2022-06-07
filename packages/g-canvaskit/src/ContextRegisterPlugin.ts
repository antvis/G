import type { RendererPlugin, Syringe } from '@antv/g';
import { Module } from '@antv/g';
import { CanvasKitContextService, ContextRegisterPluginOptions } from './CanvasKitContextService';

const containerModule = Module((register) => {
  /**
   * implements ContextService
   */
  register(CanvasKitContextService);
});

export class ContextRegisterPlugin implements RendererPlugin {
  name = 'canvaskit-context-register';

  constructor(private options: Partial<ContextRegisterPluginOptions>) {}

  init(container: Syringe.Container): void {
    container.register(ContextRegisterPluginOptions, {
      useValue: {
        ...this.options,
      },
    });
    container.load(containerModule, true);
  }
  destroy(container: Syringe.Container): void {
    container.remove(ContextRegisterPluginOptions);
    container.unload(containerModule);
  }
}
