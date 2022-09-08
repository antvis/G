import { AbstractRendererPlugin, Module } from '@antv/g-lite';
import { DragndropPlugin } from './DragndropPlugin';
import { DragndropPluginOptions } from './tokens';

const containerModule = Module((register) => {
  register(DragndropPlugin);
});

export class Plugin extends AbstractRendererPlugin {
  name = 'dragndrop';

  constructor(private options: Partial<DragndropPluginOptions> = {}) {
    super();
  }

  init(): void {
    this.container.register(DragndropPluginOptions, {
      useValue: {
        overlap: 'pointer',
        isDocumentDraggable: false,
        isDocumentDroppable: false,
        dragstartDistanceThreshold: 0,
        dragstartTimeThreshold: 0,
        ...this.options,
      },
    });
    this.container.load(containerModule, true);
  }
  destroy(): void {
    this.container.remove(DragndropPluginOptions);
    this.container.unload(containerModule);
  }
}
