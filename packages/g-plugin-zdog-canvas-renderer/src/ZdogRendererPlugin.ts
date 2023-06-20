import type { RenderingPlugin, RenderingPluginContext } from '@antv/g-lite';
import { Anchor } from 'zdog';

export class ZdogRendererPlugin implements RenderingPlugin {
  static tag = 'ZdogCanvasRenderer';

  /**
   * @see https://zzz.dog/extras#rendering-without-illustration
   */
  private scene: Anchor;

  apply(context: RenderingPluginContext) {
    const { config, contextService, renderingService } = context;
    renderingService.hooks.init.tap(ZdogRendererPlugin.tag, () => {
      /**
       * disable dirtycheck & dirty rectangle rendering
       */
      config.renderer.getConfig().enableDirtyCheck = false;
      config.renderer.getConfig().enableDirtyRectangleRendering = false;

      const context = contextService.getContext();
      // // @ts-ignore
      // context.illo = new Illustration({
      //   element: contextService.getDomElement() as HTMLCanvasElement,
      //   dragRotate: false,
      // });
      // @ts-ignore
      // this.illo = context.illo;

      this.scene = new Anchor();
      // @ts-ignore
      context.scene = this.scene;
    });

    renderingService.hooks.endFrame.tap(ZdogRendererPlugin.tag, () => {
      const context = contextService.getContext() as CanvasRenderingContext2D;
      this.scene.renderGraphCanvas(context);

      // @see https://zzz.dog/api#illustration-updaterendergraph
      this.scene.updateGraph();
    });

    renderingService.hooks.destroy.tap(ZdogRendererPlugin.tag, () => {});
  }
}
