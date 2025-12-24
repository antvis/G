import { AbstractRendererPlugin, GlobalRuntime } from '@antv/g-lite';
import { isNil } from '@antv/util';
import { ElementSVG } from './components/ElementSVG';
import { DefaultElementLifeCycleContribution } from './DefaultElementLifeCycleContribution';
import { DefElementManager } from './shapes/defs';
import { SVGRendererPlugin } from './SVGRendererPlugin';
import type { SVGRendererPluginOptions } from './interfaces';

export * from './DefaultElementLifeCycleContribution';
export * from './shapes/paths';
export * from './SVGRendererPlugin';
export * from './interfaces';
export * from './utils/dom';
export { ElementSVG };

export class Plugin extends AbstractRendererPlugin {
  name = 'svg-renderer';

  constructor(private options: Partial<SVGRendererPluginOptions> = {}) {
    super();
  }

  init(runtime: GlobalRuntime): void {
    const { outputSVGElementId, outputSVGElementName } = this.options;
    const defElementManager = new DefElementManager(this.context);

    // default implementation
    const defaultElementLifeCycleContribution =
      new DefaultElementLifeCycleContribution(this.context, runtime);
    // @ts-ignore
    this.context.defaultElementLifeCycleContribution =
      defaultElementLifeCycleContribution;

    // @ts-ignore
    this.context.SVGElementLifeCycleContribution =
      defaultElementLifeCycleContribution;

    const SVGRendererPluginOptions: SVGRendererPluginOptions = {
      outputSVGElementId: !isNil(outputSVGElementId)
        ? !!outputSVGElementId
        : true,
      outputSVGElementName: !isNil(outputSVGElementName)
        ? !!outputSVGElementName
        : true,
    };

    this.addRenderingPlugin(
      // @ts-ignore
      new SVGRendererPlugin(
        SVGRendererPluginOptions,
        defElementManager,
        this.context,
      ),
    );
  }
  destroy(): void {
    this.removeAllRenderingPlugins();

    // @ts-ignore
    delete this.context.defaultElementLifeCycleContribution;
    // @ts-ignore
    delete this.context.SVGElementLifeCycleContribution;
  }
}
