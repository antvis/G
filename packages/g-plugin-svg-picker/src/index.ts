import { RendererPlugin } from '@antv/g';
import { Module, Syringe } from 'mana-syringe';
import { SVGPickerPlugin } from './SVGPickerPlugin';

const containerModule = Module((register) => {
  register(SVGPickerPlugin);
});

export class Plugin implements RendererPlugin {
  init(container: Syringe.Container): void {
    container.load(containerModule, true);
  }
  destroy(container: Syringe.Container): void {
    container.unload(containerModule);
  }
}
