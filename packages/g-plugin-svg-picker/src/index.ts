import { AbstractRendererPlugin, Module } from '@antv/g';
import { SVGPickerPlugin } from './SVGPickerPlugin';

const containerModule = Module((register) => {
  register(SVGPickerPlugin);
});

export class Plugin extends AbstractRendererPlugin {
  name = 'svg-picker';
  init(): void {
    this.container.load(containerModule, true);
  }
  destroy(): void {
    this.container.unload(containerModule);
  }
}
