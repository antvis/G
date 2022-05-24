import type { RenderingPlugin, RenderingService } from '@antv/g';
import { CanvasConfig, ContextService, RenderingPluginContribution } from '@antv/g';
import { inject, singleton } from 'mana-syringe';
// @see https://github.com/rough-stuff/rough/issues/145
import rough from 'roughjs/bin/rough';
import type { RoughSVG } from 'roughjs/bin/svg';

@singleton({ contrib: RenderingPluginContribution })
export class RoughRendererPlugin implements RenderingPlugin {
  static tag = 'RoughSVGRenderer';

  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  @inject(ContextService)
  private contextService: ContextService<SVGSVGElement>;

  private roughSVG: RoughSVG;

  apply(renderingService: RenderingService) {
    renderingService.hooks.init.tapPromise(RoughRendererPlugin.tag, async () => {
      /**
       * disable dirtycheck & dirty rectangle rendering
       */
      // this.canvasConfig.renderer.getConfig().enableDirtyCheck = false;
      // this.canvasConfig.renderer.getConfig().enableDirtyRectangleRendering = false;

      // @see https://github.com/rough-stuff/rough/wiki#roughsvg-svgroot--config

      const $svg = this.contextService.getContext();
      this.roughSVG = rough.svg($svg);
    });

    renderingService.hooks.destroy.tap(RoughRendererPlugin.tag, () => {});
  }
}
