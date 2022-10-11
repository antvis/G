import { AbstractRendererPlugin, Module } from '@antv/g-lite';
import { isNil } from '@antv/util';
import { ElementSVG } from './components/ElementSVG';
import { DefaultElementLifeCycleContribution } from './DefaultElementLifeCycleContribution';
import { DefElementManager } from './shapes/defs';
import { SVGRendererPlugin } from './SVGRendererPlugin';
import { SVGRendererPluginOptions } from './tokens';

export * from './DefaultElementLifeCycleContribution';
export * from './shapes/paths';
export * from './SVGRendererPlugin';
export * from './tokens';
export * from './utils/dom';
export { ElementSVG };

export const containerModule = Module((register) => {
  register(DefElementManager);
  register(DefaultElementLifeCycleContribution);
  register(SVGRendererPlugin);
});

export class Plugin extends AbstractRendererPlugin {
  name = 'svg-renderer';

  constructor(private options: Partial<SVGRendererPluginOptions> = {}) {
    super();
  }

  init(): void {
    const { outputSVGElementId, outputSVGElementName } = this.options;

    this.container.register(SVGRendererPluginOptions, {
      useValue: {
        outputSVGElementId: !isNil(outputSVGElementId) ? !!outputSVGElementId : true,
        outputSVGElementName: !isNil(outputSVGElementName) ? !!outputSVGElementName : true,
      },
    });

    this.container.load(containerModule, true);
  }
  destroy(): void {
    this.container.remove(SVGRendererPluginOptions);
    this.container.unload(containerModule);
  }
}
