import { inject, singleton } from 'mana-syringe';
// import { CanvasConfig } from '../types';
import type { RenderingService, RenderingPlugin } from '../services/RenderingService';
import { RenderingPluginContribution } from '../services/RenderingService';
import { RenderingContext, RenderReason } from '../services/RenderingContext';
import type { DisplayObject } from '../display-objects/DisplayObject';

/**
 * Filter dirty renderables and calculate the "dirty rectangle" which will be clear when frame began
 */
@singleton({ contrib: RenderingPluginContribution })
export class DirtyCheckPlugin implements RenderingPlugin {
  // @inject(CanvasConfig)
  // private canvasConfig: CanvasConfig;

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  apply(renderingService: RenderingService) {
    renderingService.hooks.dirtycheck.tap((object: DisplayObject | null) => {
      if (object) {
        // const { enableDirtyRectangleRendering } = this.canvasConfig.renderer.getConfig();

        const renderable = object.renderable;
        const isDirty =
          renderable.dirty || this.renderingContext.renderReasons.has(RenderReason.CAMERA_CHANGED);
        // if (isDirty || !enableDirtyRectangleRendering) {
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
