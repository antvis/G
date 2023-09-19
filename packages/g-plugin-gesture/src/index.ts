import { AbstractRendererPlugin } from '@antv/g-lite';
import { GesturePlugin } from './GesturePlugin';
import type { GesturePluginOptions } from './interfaces';

export class Plugin extends AbstractRendererPlugin {
  name = 'gesture';

  constructor(private options: Partial<GesturePluginOptions> = {}) {
    super();
  }

  init(): void {
    this.addRenderingPlugin(
      new GesturePlugin({
        isDocumentGestureEnabled: false,
        ...this.options,
      }),
    );
  }

  destroy(): void {
    this.removeAllRenderingPlugins();
  }
}
