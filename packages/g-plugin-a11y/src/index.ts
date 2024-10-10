import { AbstractRendererPlugin } from '@antv/g-lite';
import { A11yPlugin } from './A11yPlugin';
import { AriaManager } from './AriaManager';
import { TextExtractor } from './TextExtractor';
import type { A11yPluginOptions } from './interfaces';

export class Plugin extends AbstractRendererPlugin {
  name = 'a11y';

  constructor(private options: Partial<A11yPluginOptions> = {}) {
    super();
  }

  init(): void {
    const a11yPluginOptions: Partial<A11yPluginOptions> = {
      enableExtractingText: false,
      enableARIA: true,
      ...this.options,
    };

    const textExtractor = new TextExtractor(this.context);
    const ariaManager = new AriaManager(this.context, a11yPluginOptions);

    this.addRenderingPlugin(
      new A11yPlugin(a11yPluginOptions, textExtractor, ariaManager),
    );
  }
  destroy(): void {
    this.removeAllRenderingPlugins();
  }
}
