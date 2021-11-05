import { inject, injectable } from 'inversify';
import { Renderable } from '../components';
import { CanvasConfig } from '../types';
import { RenderingService, RenderingPlugin } from '../services/RenderingService';
import { RenderingContext, RENDER_REASON } from '../services/RenderingContext';
import { DisplayObject } from '../display-objects/DisplayObject';

/**
 * Filter dirty renderables and calculate the "dirty rectangle" which will be clear when frame began
 */
@injectable()
export class DirtyCheckPlugin implements RenderingPlugin {
  static tag = 'DirtyCheckPlugin';

  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  apply(renderingService: RenderingService) {
    renderingService.hooks.prepare.tap(DirtyCheckPlugin.tag, (object: DisplayObject | null) => {
      if (object) {
        const { enableDirtyRectangleRendering } = this.canvasConfig.renderer.getConfig();

        const renderable = object.getEntity().getComponent(Renderable);
        const isDirty =
          renderable.dirty || this.renderingContext.renderReasons.has(RENDER_REASON.CameraChanged);
        if (isDirty || !enableDirtyRectangleRendering) {
          return object;
        } else {
          return null;
        }
      }

      return object;
    });
  }
}
