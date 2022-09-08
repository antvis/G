import { AbstractRendererPlugin, Module } from '@antv/g';
import { A11yPlugin } from './A11yPlugin';
import { AriaManager } from './AriaManager';
import { TextExtractor } from './TextExtractor';
import { A11yPluginOptions } from './tokens';

const containerModule = Module((register) => {
  register(TextExtractor);
  register(AriaManager);
  register(A11yPlugin);
});

export class Plugin extends AbstractRendererPlugin {
  name = 'a11y';

  constructor(private options: Partial<A11yPluginOptions> = {}) {
    super();
  }

  init(): void {
    this.container.register(A11yPluginOptions, {
      useValue: {
        enableExtractingText: false,
        ...this.options,
      },
    });
    this.container.load(containerModule, true);
  }
  destroy(): void {
    this.container.remove(A11yPluginOptions);
    this.container.unload(containerModule);
  }
}
