import type { RenderingPlugin, RenderingPluginContext } from '@antv/g-lite';
// @see https://github.com/rough-stuff/rough/issues/145
import rough from 'roughjs/bin/rough';
import type { RoughSVG } from 'roughjs/bin/svg';

export class RoughRendererPlugin implements RenderingPlugin {
  static tag = 'RoughSVGRenderer';

  apply(context: RenderingPluginContext) {
    const { contextService, renderingService } = context;
    renderingService.hooks.init.tap(RoughRendererPlugin.tag, () => {
      /**
       * disable dirtycheck & dirty rectangle rendering
       */
      // this.canvasConfig.renderer.getConfig().enableDirtyCheck = false;
      // this.canvasConfig.renderer.getConfig().enableDirtyRectangleRendering = false;

      // @see https://github.com/rough-stuff/rough/wiki#roughsvg-svgroot--config
      const $svg = contextService.getContext() as SVGSVGElement & {
        roughSVG: RoughSVG;
      };
      $svg.roughSVG = rough.svg($svg);
    });

    renderingService.hooks.destroy.tap(RoughRendererPlugin.tag, () => {});
  }
}
