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

  addEventListener(eventName: string, fn: (...args: any[]) => void) {
    this.container.get(AnnotationPlugin).emmiter.on(eventName, (e) => {
      fn(e);
      console.log('on', eventName, e);
    });
  }

  setDrawer(tool: DrawerTool, options) {
    this.container.get(AnnotationPlugin).setDrawer(tool, options);
  }

  redo() {
    this.container.get(AnnotationPlugin).redo();
  }

  undo() {
    this.container.get(AnnotationPlugin).undo();
  }

  deleteAll() {
    this.container.get(AnnotationPlugin).deleteAll();
  }

  destroy(): void {
    this.container.remove(AnnotationPluginOptions);
    this.container.unload(containerModule);
  }
}
export * from './constants/enum';
