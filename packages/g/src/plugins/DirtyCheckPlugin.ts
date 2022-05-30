import { inject, singleton } from 'mana-syringe';
import type { DisplayObject } from '../display-objects/DisplayObject';
import { RenderingContext, RenderReason } from '../services/RenderingContext';
import type { RenderingPlugin, RenderingService } from '../services/RenderingService';
import { RenderingPluginContribution } from '../services/RenderingService';

/**
 * Filter dirty renderables and calculate the "dirty rectangle" which will be clear when frame began
 */
@singleton({ contrib: RenderingPluginContribution })
export class DirtyCheckPlugin implements RenderingPlugin {
  static tag = 'DirtyCheck';

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  apply(renderingService: RenderingService) {
    renderingService.hooks.dirtycheck.tap(DirtyCheckPlugin.tag, (object: DisplayObject | null) => {
      if (object) {
        const renderable = object.renderable;
        const isCameraDirty = this.renderingContext.renderReasons.has(RenderReason.CAMERA_CHANGED);
        const isDirty = renderable.dirty || isCameraDirty;

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
