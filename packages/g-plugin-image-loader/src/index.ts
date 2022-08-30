import { AbstractRendererPlugin, RenderingPluginContribution } from '@antv/g-lite';
import { ImagePool } from './ImagePool';
import { LoadImagePlugin } from './LoadImagePlugin';

export { ImagePool };

// const containerModule = Module((register) => {
//   register(ImagePool);
//   register(LoadImagePlugin);
// });

export class Plugin extends AbstractRendererPlugin {
  name = 'image-loader';
  init(): void {
    this.container.registerSingleton(ImagePool);
    this.container.registerSingleton(RenderingPluginContribution, LoadImagePlugin);

    // this.container.load(containerModule, true);
  }
  destroy(): void {
    // this.container.unload(containerModule);
  }
}
