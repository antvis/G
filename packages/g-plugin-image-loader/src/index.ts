import type { RendererPlugin } from '@antv/g';
import type { Syringe } from 'mana-syringe';
import { Module } from 'mana-syringe';
import { ImagePool } from './ImagePool';
import { LoadImagePlugin } from './LoadImagePlugin';

export { ImagePool };

const containerModule = Module((register) => {
  register(ImagePool);
  register(LoadImagePlugin);
});

export class Plugin implements RendererPlugin {
  name = 'image-loader';
  init(container: Syringe.Container): void {
    container.load(containerModule, true);
  }
  destroy(container: Syringe.Container): void {
    container.unload(containerModule);
  }
}
