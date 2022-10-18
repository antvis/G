import { AbstractRendererPlugin } from '@antv/g-lite';
import { RoughElementLifeCycleContribution } from './RoughElementLifeCycleContribution';
import { RoughRendererPlugin } from './RoughRendererPlugin';
export class Plugin extends AbstractRendererPlugin {
  name = 'rough-svg-renderer';
  init(): void {
    const roughElementLifeCycleContribution = new RoughElementLifeCycleContribution(this.context);

    // @ts-ignore
    this.context.SVGElementLifeCycleContribution = roughElementLifeCycleContribution;

    this.addRenderingPlugin(new RoughRendererPlugin());
  }
  destroy(): void {
    this.removeAllRenderingPlugins();

    // @ts-ignore
    this.context.SVGElementLifeCycleContribution = this.context.defaultElementLifeCycleContribution;
  }
}
