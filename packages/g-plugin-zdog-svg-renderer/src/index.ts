import { AbstractRendererPlugin } from '@antv/g-lite';
import { ZdogElementLifeCycleContribution } from './ZdogElementLifeCycleContribution';
import { ZdogRendererPlugin } from './ZdogRendererPlugin';
export class Plugin extends AbstractRendererPlugin {
  name = 'zdog-svg-renderer';
  init(): void {
    const zdogElementLifeCycleContribution =
      new ZdogElementLifeCycleContribution(this.context);

    // @ts-ignore
    this.context.SVGElementLifeCycleContribution =
      zdogElementLifeCycleContribution;

    this.addRenderingPlugin(new ZdogRendererPlugin());
  }
  destroy(): void {
    this.removeAllRenderingPlugins();

    // @ts-ignore
    this.context.SVGElementLifeCycleContribution =
      this.context.defaultElementLifeCycleContribution;
  }
}
