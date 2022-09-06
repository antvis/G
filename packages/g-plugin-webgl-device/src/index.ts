import { AbstractRendererPlugin, Module } from '@antv/g-lite';
import { WebGLRendererPluginOptions } from './interfaces';
import { WebGLDeviceContribution } from './WebGLDeviceContribution';

const containerModule = Module((register) => {
  register(WebGLDeviceContribution);
});

export class Plugin extends AbstractRendererPlugin {
  name = 'webgl-device';
  constructor(private options: Partial<WebGLRendererPluginOptions>) {
    super();
  }

  init(): void {
    this.container.register(WebGLRendererPluginOptions, {
      useValue: {
        ...this.options,
      },
    });
    this.container.load(containerModule, true);
  }
  destroy(): void {
    this.container.remove(WebGLRendererPluginOptions);
    this.container.unload(containerModule);
  }
}
