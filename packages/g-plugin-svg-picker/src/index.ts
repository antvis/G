import type { RendererPlugin, Syringe } from '@antv/g';
import { Module } from '@antv/g';
import { SVGPickerPlugin } from './SVGPickerPlugin';

const containerModule = Module((register) => {
  register(SVGPickerPlugin);
});

export class Plugin implements RendererPlugin {
  name = 'svg-picker';
  init(container: Syringe.Container): void {
    container.load(containerModule, true);
  }
  destroy(container: Syringe.Container): void {
    container.unload(containerModule);
  }
}
