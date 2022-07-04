import type { RendererPlugin, Syringe } from '@antv/g';
import { Module } from '@antv/g';
import { AnnotationPlugin } from './AnnotationPlugin';
import { AnnotationPluginOptions } from './tokens';

const containerModule = Module((register) => {
  register(AnnotationPlugin);
});

export class Plugin implements RendererPlugin {
  name = 'annotation';

  constructor(private options: Partial<AnnotationPluginOptions> = {}) {}

  init(container: Syringe.Container): void {
    container.register(AnnotationPluginOptions, {
      useValue: {
        ...this.options,
      },
    });
    container.load(containerModule, true);
  }
  destroy(container: Syringe.Container): void {
    container.remove(AnnotationPluginOptions);
    container.unload(containerModule);
  }
}
