import { AbstractRendererPlugin, Module } from '@antv/g-lite';
import { CanvasKitContextService, ContextRegisterPluginOptions } from './CanvasKitContextService';

const containerModule = Module((register) => {
  /**
   * implements ContextService
   */
  register(CanvasKitContextService);
});

export class ContextRegisterPlugin extends AbstractRendererPlugin {
  name = 'canvaskit-context-register';

  constructor(private options: Partial<ContextRegisterPluginOptions>) {
    super();
  }

  init(): void {
    this.container.register(ContextRegisterPluginOptions, {
      useValue: {
        ...this.options,
      },
    });
    this.container.load(containerModule, true);
  }
  destroy(): void {
    this.container.remove(ContextRegisterPluginOptions);
    this.container.unload(containerModule);
  }
}
