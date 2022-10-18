import { AbstractRendererPlugin, CSS, PropertySyntax } from '@antv/g-lite';
import type { YogaPluginOptions } from './interfaces';
import { YogaPlugin } from './YogaPlugin';

export class Plugin extends AbstractRendererPlugin {
  name = 'yoga';

  constructor(private options: Partial<YogaPluginOptions>) {
    super();
  }

  init(): void {
    this.addRenderingPlugin(
      new YogaPlugin({
        ...this.options,
      }),
    );

    [
      'top',
      'right',
      'bottom',
      'left',
      'marginAll',
      'marginTop',
      'marginRight',
      'marginBottom',
      'marginLeft',
      'paddingAll',
      'paddingTop',
      'paddingRight',
      'paddingBottom',
      'paddingLeft',
      'minWidth',
      'maxWidth',
      'minHeight',
      'maxHeight',
    ].forEach((name) => {
      CSS.registerProperty({
        name,
        inherits: false,
        initialValue: '0',
        interpolable: true,
        syntax: PropertySyntax.LENGTH_PERCENTAGE,
      });
    });

    ['margin', 'padding'].forEach((name) => {
      CSS.registerProperty({
        name,
        inherits: false,
        initialValue: '0',
        interpolable: true,
        syntax: PropertySyntax.LENGTH_PERCENTAGE_14,
      });
    });

    ['flexGrow', 'flexShrink', 'flexBasis'].forEach((name) => {
      CSS.registerProperty({
        name,
        inherits: false,
        initialValue: '0',
        interpolable: true,
        syntax: PropertySyntax.SHADOW_BLUR,
      });
    });
  }
  destroy(): void {
    this.removeAllRenderingPlugins();

    // TODO: unregister CSS properties
  }
}
