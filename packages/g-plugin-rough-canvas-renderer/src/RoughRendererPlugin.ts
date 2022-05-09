import type { RenderingService, RenderingPlugin } from '@antv/g';
import { CanvasConfig, ContextService, RenderingPluginContribution } from '@antv/g';
import { inject, singleton } from 'mana-syringe';
// @see https://github.com/rough-stuff/rough/issues/145
import rough from 'roughjs/bin/rough';

@singleton({ contrib: RenderingPluginContribution })
export class RoughRendererPlugin implements RenderingPlugin {
  static tag = 'RoughCanvasRenderer';

  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  @inject(ContextService)
  private contextService: ContextService<CanvasRenderingContext2D>;

  apply(renderingService: RenderingService) {
    renderingService.hooks.init.tapPromise(RoughRendererPlugin.tag, async () => {
      /**
       * disable dirtycheck & dirty rectangle rendering
       */
      this.canvasConfig.renderer.getConfig().enableDirtyCheck = false;
      this.canvasConfig.renderer.getConfig().enableDirtyRectangleRendering = false;

      const context = this.contextService.getContext();
      // @see https://github.com/rough-stuff/rough/wiki#roughcanvas-canvaselement--config
      // @ts-ignore
      context.roughCanvas = rough.canvas(this.contextService.getDomElement() as HTMLCanvasElement);
    });
  }
}
