import {
  AbstractRendererPlugin,
  CSS,
  PropertySyntax,
  RenderingPluginContribution,
} from '@antv/g-lite';
import { YogaPluginOptions } from './tokens';
import { YogaPlugin } from './YogaPlugin';

// const containerModule = Module((register) => {
//   register(YogaPlugin);
// });

export class Plugin extends AbstractRendererPlugin {
  name = 'yoga';

  constructor(private options: Partial<YogaPluginOptions>) {
    super();
  }

  init(): void {
    this.container.register(YogaPluginOptions, {
      useValue: {
        ...this.options,
      },
    });
    // this.container.load(containerModule, true);

    this.container.registerSingleton(RenderingPluginContribution, YogaPlugin);

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
    // this.container.remove(YogaPluginOptions);
    // this.container.unload(containerModule);
    // TODO: unregister CSS properties
  }
}
