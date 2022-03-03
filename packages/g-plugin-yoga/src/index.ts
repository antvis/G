import { DisplayObject, RendererPlugin } from '@antv/g';
import { Module, Syringe } from 'mana-syringe';
import { YogaPlugin } from './YogaPlugin';
import { YogaPluginOptions } from './tokens';

const containerModule = Module((register) => {
  register(YogaPlugin);
});

export class Plugin implements RendererPlugin {
  private container: Syringe.Container;

  constructor(private options: Partial<YogaPluginOptions>) {}

  init(container: Syringe.Container): void {
    this.container = container;
    container.register(YogaPluginOptions, {
      useValue: {
        ...this.options,
      },
    });
    container.load(containerModule, true);
  }
  destroy(container: Syringe.Container): void {
    container.remove(YogaPluginOptions);
    container.remove(YogaPlugin);
    // @ts-ignore
    // container.container.unload(containerModule);
    // container.unload(containerModule);
  }
}
