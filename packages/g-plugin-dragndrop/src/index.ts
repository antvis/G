import { AbstractRendererPlugin } from '@antv/g-lite';
import { DragndropPlugin } from './DragndropPlugin';
import type { DragndropPluginOptions } from './interfaces';

export class Plugin extends AbstractRendererPlugin {
  name = 'dragndrop';

  constructor(private options: Partial<DragndropPluginOptions> = {}) {
    super();
  }

  init(): void {
    this.addRenderingPlugin(
      new DragndropPlugin({
        overlap: 'pointer',
        isDocumentDraggable: false,
        isDocumentDroppable: false,
        dragstartDistanceThreshold: 0,
        dragstartTimeThreshold: 0,
        ...this.options,
      }),
    );
  }
  destroy(): void {
    this.removeAllRenderingPlugins();
  }
  setOptions(options: Partial<DragndropPluginOptions>): void {
    Object.assign(
      (this.plugins[0] as DragndropPlugin).dragndropPluginOptions,
      options,
    );
  }
}
