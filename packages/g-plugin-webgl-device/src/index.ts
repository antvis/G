import type { RendererPlugin } from '@antv/g';
import type { Syringe } from 'mana-syringe';
import { Module } from 'mana-syringe';
import { WebGLRendererPluginOptions } from './interfaces';
import { WebGLDeviceContribution } from './WebGLDeviceContribution';

const containerModule = Module((register) => {
  register(WebGLDeviceContribution);
});

export class Plugin implements RendererPlugin {
  name = 'webgl-device';
  constructor(private options: Partial<WebGLRendererPluginOptions>) {}

  init(container: Syringe.Container): void {
    container.register(WebGLRendererPluginOptions, {
      useValue: {
        ...this.options,
      },
    });
    container.load(containerModule, true);
  }
  destroy(container: Syringe.Container): void {
    container.remove(WebGLRendererPluginOptions);
    container.unload(containerModule);
  }
}
