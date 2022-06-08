import type { RendererPlugin, Syringe } from '@antv/g';
import { Module } from '@antv/g';
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
