import type { RenderingPlugin, RenderingPluginContext } from '@antv/g-lite';
import { Illustration } from 'zdog';

export class ZdogRendererPlugin implements RenderingPlugin {
  static tag = 'ZdogCanvasRenderer';

  /**
   * @see https://zzz.dog/api#illustration
   */
  private illo: Illustration;

  apply(context: RenderingPluginContext) {
    const { config, contextService, renderingService } = context;
    renderingService.hooks.init.tapPromise(ZdogRendererPlugin.tag, async () => {
      /**
       * disable dirtycheck & dirty rectangle rendering
       */
      config.renderer.getConfig().enableDirtyCheck = false;
      config.renderer.getConfig().enableDirtyRectangleRendering = false;

      const context = contextService.getContext();
      // @ts-ignore
      context.illo = new Illustration({
        element: contextService.getDomElement() as HTMLCanvasElement,
        dragRotate: false,
      });
      // @ts-ignore
      this.illo = context.illo;
    });

    renderingService.hooks.endFrame.tap(ZdogRendererPlugin.tag, () => {
      // @see https://zzz.dog/api#illustration-updaterendergraph
      this.illo.updateRenderGraph();
    });

    renderingService.hooks.destroy.tap(ZdogRendererPlugin.tag, () => {});
  }
}
