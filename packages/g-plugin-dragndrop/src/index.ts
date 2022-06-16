import type { RendererPlugin, Syringe } from '@antv/g';
import { Module } from '@antv/g';
import { DragndropPlugin } from './DragndropPlugin';
import { DragndropPluginOptions } from './tokens';

const containerModule = Module((register) => {
  register(DragndropPlugin);
});

export class Plugin implements RendererPlugin {
  name = 'dragndrop';

  constructor(private options: Partial<DragndropPluginOptions> = {}) {}

  init(container: Syringe.Container): void {
    container.register(DragndropPluginOptions, {
      useValue: {
        overlap: 'pointer',
        isDocumentDraggable: false,
        isDocumentDroppable: false,
        dragstartDistanceThreshold: 0,
        dragstartTimeThreshold: 0,
        ...this.options,
      },
    });
    container.load(containerModule, true);
  }
  destroy(container: Syringe.Container): void {
    container.remove(DragndropPluginOptions);
    container.unload(containerModule);
  }
}
