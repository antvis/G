import type { RendererPlugin } from '@antv/g';
import type { Syringe } from 'mana-syringe';
import { Module } from 'mana-syringe';
import { DragndropPlugin } from './DragndropPlugin';
import { DragndropPluginOptions } from './tokens';

const containerModule = Module((register) => {
  register(DragndropPlugin);
});

export class Plugin implements RendererPlugin {
  name = 'dragndrop';

  constructor(private options: Partial<DragndropPluginOptions>) {}

  init(container: Syringe.Container): void {
    container.register(DragndropPluginOptions, {
      useValue: {
        overlap: 'pointer',
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
