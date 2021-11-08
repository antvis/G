import { RendererPlugin } from '@antv/g';
import { Module, Syringe } from 'mana-syringe';
import { SVGPickerPlugin } from './SVGPickerPlugin';

const containerModule = Module((register) => {
  register(SVGPickerPlugin);
});

export class Plugin implements RendererPlugin {
  init(container: Syringe.Container): void {
    container.load(containerModule);
  }
  destroy(container: Syringe.Container): void {
    // @ts-ignore
    // container.container.unload(containerModule);
    // container.unload(containerModule);
  }
}
