import { AbstractRendererPlugin, Module } from '@antv/g';
import { AnnotationPlugin } from './AnnotationPlugin';
import type { DrawerTool } from './constants/enum';
import type { DrawerOption } from './interface/drawer';
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
    console.log('on', eventName);
    this.container.get(AnnotationPlugin).emmiter.on(eventName, (e) => {
      fn(e);
    });
  }

  removeEventListener(eventName: string, fn: (...args: any[]) => void) {
    this.container.get(AnnotationPlugin).emmiter.off(eventName, (e) => {
      fn(e);
      console.log('on', eventName, e);
    });
  }

  setDrawer(tool: DrawerTool, options?: DrawerOption) {
    this.container.get(AnnotationPlugin).setDrawer(tool, options);
  }

  destroy(): void {
    this.container.remove(AnnotationPluginOptions);
    this.container.unload(containerModule);
  }
}
export * from './constants/enum';
