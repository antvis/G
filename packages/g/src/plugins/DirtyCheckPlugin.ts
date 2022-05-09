import { inject, singleton } from 'mana-syringe';
import { CanvasConfig } from '../types';
import type { RenderingService, RenderingPlugin } from '../services/RenderingService';
import { RenderingPluginContribution } from '../services/RenderingService';
import { RenderingContext, RenderReason } from '../services/RenderingContext';
import type { DisplayObject } from '../display-objects/DisplayObject';

/**
 * Filter dirty renderables and calculate the "dirty rectangle" which will be clear when frame began
 */
@singleton({ contrib: RenderingPluginContribution })
export class DirtyCheckPlugin implements RenderingPlugin {
  static tag = 'DirtyCheck';

  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  apply(renderingService: RenderingService) {
    renderingService.hooks.dirtycheck.tap(DirtyCheckPlugin.tag, (object: DisplayObject | null) => {
      if (object) {
        const { enableDirtyCheck } = this.canvasConfig.renderer.getConfig();

        const renderable = object.renderable;
        const isCameraDirty = this.renderingContext.renderReasons.has(RenderReason.CAMERA_CHANGED);
        const isRenderingContextDirty = this.renderingContext.dirty;
        const isDirty =
          renderable.dirty || isCameraDirty || (enableDirtyCheck ? false : isRenderingContextDirty);

        if (isDirty) {
          return object;
        } else {
          return null;
        }
      }

      return object;
    });
  }
}
