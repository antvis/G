import type { RendererPlugin, Syringe } from '@antv/g';
import { Module } from '@antv/g';
import { A11yPlugin } from './A11yPlugin';
import { TextExtractor } from './TextExtractor';
import { A11yPluginOptions } from './tokens';

const containerModule = Module((register) => {
  register(TextExtractor);
  register(A11yPlugin);
});

export class Plugin implements RendererPlugin {
  name = 'a11y';

  constructor(private options: Partial<A11yPluginOptions> = {}) {}

  init(container: Syringe.Container): void {
    container.register(A11yPluginOptions, {
      useValue: {
        enableExtractingText: false,
        ...this.options,
      },
    });
    container.load(containerModule, true);
  }
  destroy(container: Syringe.Container): void {
    container.remove(A11yPluginOptions);
    container.unload(containerModule);
  }
}
