import { AbstractRendererPlugin, Module } from '@antv/g';
import { AnnotationPlugin } from './AnnotationPlugin';
import { AnnotationPluginOptions } from './tokens';

const containerModule = Module((register) => {
  register(AnnotationPlugin);
});

export class Plugin extends AbstractRendererPlugin {
  name = 'annotation';

  constructor(private options: Partial<AnnotationPluginOptions> = {}) {
    super();
  }

  init(): void {
    this.container.register(AnnotationPluginOptions, {
      useValue: {
        ...this.options,
      },
    });
    this.container.load(containerModule, true);
  }
  destroy(): void {
    this.container.remove(AnnotationPluginOptions);
    this.container.unload(containerModule);
  }
}
