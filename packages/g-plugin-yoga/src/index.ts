import type { RendererPlugin } from '@antv/g';
// import {
//   addPropertiesHandler,
//   parseNumber,
//   parseLengthOrPercent,
//   parseLengthOrPercentList,
//   clampedMergeNumbers,
//   mergeDimensions,
// } from '@antv/g';
import type { Syringe } from 'mana-syringe';
import { Module } from 'mana-syringe';
import { YogaPlugin } from './YogaPlugin';
import { YogaPluginOptions } from './tokens';

const containerModule = Module((register) => {
  register(YogaPlugin);
});

// addPropertiesHandler<number, number>(
//   [
//     'top',
//     'right',
//     'bottom',
//     'left',
//     'marginAll',
//     'marginTop',
//     'marginRight',
//     'marginBottom',
//     'marginLeft',
//     'paddingAll',
//     'paddingTop',
//     'paddingRight',
//     'paddingBottom',
//     'paddingLeft',
//     'minWidth',
//     'maxWidth',
//     'minHeight',
//     'maxHeight',
//   ],
//   parseLengthOrPercent,
//   // @ts-ignore
//   mergeDimensions,
//   undefined,
// );
// addPropertiesHandler<number[], number[]>(
//   ['margin', 'padding'],
//   // @ts-ignore
//   parseLengthOrPercentList,
//   // @ts-ignore
//   // mergeNumberLists,
//   undefined,
//   undefined,
// );

// addPropertiesHandler<number, number>(
//   ['flexGrow', 'flexShrink', 'flexBasis'],
//   parseNumber,
//   clampedMergeNumbers(0, Infinity),
//   undefined,
// );

export class Plugin implements RendererPlugin {
  name = 'yoga';
  private container: Syringe.Container;

  constructor(private options: Partial<YogaPluginOptions>) {}

  init(container: Syringe.Container): void {
    this.container = container;
    container.register(YogaPluginOptions, {
      useValue: {
        ...this.options,
      },
    });
    container.load(containerModule, true);
  }
  destroy(container: Syringe.Container): void {
    container.remove(YogaPluginOptions);
    container.unload(containerModule);
  }
}
