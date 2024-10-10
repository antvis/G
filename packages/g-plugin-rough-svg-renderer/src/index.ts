import { AbstractRendererPlugin, GlobalRuntime } from '@antv/g-lite';
import { RoughElementLifeCycleContribution } from './RoughElementLifeCycleContribution';
import { RoughRendererPlugin } from './RoughRendererPlugin';

export class Plugin extends AbstractRendererPlugin {
  name = 'rough-svg-renderer';
  init(runtime: GlobalRuntime): void {
    const roughElementLifeCycleContribution =
      new RoughElementLifeCycleContribution(this.context, runtime);

    // @ts-ignore
    this.context.SVGElementLifeCycleContribution =
      roughElementLifeCycleContribution;

    this.addRenderingPlugin(new RoughRendererPlugin());
  }
  destroy(): void {
    this.removeAllRenderingPlugins();

    // @ts-ignore
    this.context.SVGElementLifeCycleContribution =
      this.context.defaultElementLifeCycleContribution;
  }
}
