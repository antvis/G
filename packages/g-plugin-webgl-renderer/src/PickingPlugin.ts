import {
  RenderingService,
  RenderingPlugin,
  SceneGraphService,
  PickingResult,
  Rectangle,
  ContextService,
} from '@antv/g';
import { clamp } from '@antv/util';
import { inject, injectable } from 'inversify';
import { IRenderPass, RenderPassFactory } from './FrameGraphEngine';
import { RenderPass, RenderPassData } from './passes/RenderPass';
import { View } from './View';

/**
 * Use color-based picking in GPU
 */
@injectable()
export class PickingPlugin implements RenderingPlugin {
  static tag = 'PickingPlugin';

  @inject(SceneGraphService)
  protected sceneGraphService: SceneGraphService;

  @inject(ContextService)
  private contextService: ContextService<WebGLRenderingContext>;

  @inject(View)
  private view: View;

  @inject(RenderPassFactory)
  private renderPassFactory: <T>(name: string) => IRenderPass<T>;

  apply(renderingService: RenderingService) {
    renderingService.hooks.pick.tap(PickingPlugin.tag, (result: PickingResult) => {
      const { x, y } = result.position;
      const { width, height } = this.view.getViewport();

      const dpr = this.contextService.getDPR();
      const xInDevicePixel = x * dpr;
      const yInDevicePixel = y * dpr;

      if (
        xInDevicePixel > width ||
        xInDevicePixel < 0 ||
        yInDevicePixel > height ||
        yInDevicePixel < 0
      ) {
        return {
          position: result.position,
          picked: null,
        };
      }

      const renderPass = this.renderPassFactory<RenderPassData>(
        RenderPass.IDENTIFIER,
      ) as RenderPass;

      const [pickedDisplayObject] = renderPass.pickByRectangle(
        new Rectangle(
          clamp(Math.round(xInDevicePixel), 0, width - 1),
          // flip Y
          clamp(Math.round(height - (y + 1) * dpr), 0, height - 1),
          1,
          1,
        ),
      );

      return {
        position: result.position,
        picked: pickedDisplayObject || null,
      };
    });
  }
}
