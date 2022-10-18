import type { RenderingPlugin, RenderingPluginContext } from '@antv/g-lite';
// @see https://github.com/rough-stuff/rough/issues/145
import rough from 'roughjs/bin/rough';

export class RoughRendererPlugin implements RenderingPlugin {
  static tag = 'RoughCanvasRenderer';

  apply(context: RenderingPluginContext) {
    const { config, contextService, renderingService } = context;
    renderingService.hooks.init.tapPromise(RoughRendererPlugin.tag, async () => {
      /**
       * disable dirtycheck & dirty rectangle rendering
       */
      config.renderer.getConfig().enableDirtyCheck = false;
      config.renderer.getConfig().enableDirtyRectangleRendering = false;

      const context = contextService.getContext();
      // @see https://github.com/rough-stuff/rough/wiki#roughcanvas-canvaselement--config
      // @ts-ignore
      context.roughCanvas = rough.canvas(contextService.getDomElement() as HTMLCanvasElement);
    });

    renderingService.hooks.destroy.tap(RoughRendererPlugin.tag, () => {});
  }
}
