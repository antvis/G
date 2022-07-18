import { AbstractRendererPlugin, Module } from '@antv/g';
import { AnnotationPlugin } from './AnnotationPlugin';
import type { DrawerTool } from './constants/enum';
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

  setDrawer(tool: DrawerTool) {
    return this.container.get(AnnotationPlugin).setDrawer(tool, {});
  }

  redo() {
    return this.container.get(AnnotationPlugin).redo();
  }

  undo() {
    return this.container.get(AnnotationPlugin).undo();
  }

  deleteAll() {
    return this.container.get(AnnotationPlugin).deleteAll();
  }

  destroy(): void {
    this.container.remove(AnnotationPluginOptions);
    this.container.unload(containerModule);
  }
}
export * from './constants/enum';
