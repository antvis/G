import type { RenderingService, RenderingPlugin, PickingResult } from '@antv/g';
import {
  RenderingPluginContribution,
  SceneGraphService,
  Rectangle,
  ContextService,
  CanvasConfig,
} from '@antv/g';
import { clamp } from '@antv/util';
import { inject, singleton } from 'mana-syringe';
import { RenderGraphPlugin } from './RenderGraphPlugin';

/**
 * Use color-based picking in GPU
 */
@singleton({ contrib: RenderingPluginContribution })
export class PickingPlugin implements RenderingPlugin {
  static tag = 'PickingPlugin';

  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  @inject(SceneGraphService)
  protected sceneGraphService: SceneGraphService;

  @inject(ContextService)
  private contextService: ContextService<WebGLRenderingContext>;

  @inject(RenderGraphPlugin)
  private renderGraphPlugin: RenderGraphPlugin;

  apply(renderingService: RenderingService) {
    renderingService.hooks.pick.tapPromise(PickingPlugin.tag, async (result: PickingResult) => {
      // use viewportX/Y
      const { viewportX: x, viewportY: y } = result.position;
      const dpr = this.contextService.getDPR();
      const width = this.canvasConfig.width * dpr;
      const height = this.canvasConfig.height * dpr;

      const xInDevicePixel = x * dpr;
      const yInDevicePixel = y * dpr;

      if (
        xInDevicePixel > width ||
        xInDevicePixel < 0 ||
        yInDevicePixel > height ||
        yInDevicePixel < 0
      ) {
        result.picked = null;
        return result;
      }

      const [pickedDisplayObject] = await this.renderGraphPlugin.pickByRectangle(
        new Rectangle(
          clamp(Math.round(xInDevicePixel), 0, width - 1),
          // flip Y
          clamp(Math.round(height - (y + 1) * dpr), 0, height - 1),
          1,
          1,
        ),
      );

      result.picked = pickedDisplayObject || null;
      return result;
    });
  }
}
