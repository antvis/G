import { AbstractRendererPlugin } from '@antv/g-lite';
import type { ContextRegisterPluginOptions } from './CanvasKitContextService';
import { CanvasKitContextService } from './CanvasKitContextService';

export class ContextRegisterPlugin extends AbstractRendererPlugin {
  name = 'canvaskit-context-register';

  constructor(private options: Partial<ContextRegisterPluginOptions>) {
    super();
  }

  init(): void {
    const contextRegisterPluginOptions = {
      ...this.options,
    };
    // @ts-ignore
    this.context.contextRegisterPluginOptions = contextRegisterPluginOptions;
    this.context.ContextService = CanvasKitContextService;
  }
  destroy(): void {
    delete this.context.ContextService;
  }
}
