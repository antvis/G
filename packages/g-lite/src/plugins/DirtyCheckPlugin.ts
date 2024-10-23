import type { DisplayObject } from '../display-objects/DisplayObject';
import type {
  RenderingPlugin,
  RenderingPluginContext,
} from '../services/RenderingService';

/**
 * Filter dirty renderables and calculate the "dirty rectangle" which will be clear when frame began
 */
export class DirtyCheckPlugin implements RenderingPlugin {
  static tag = 'DirtyCheck';

  apply(context: RenderingPluginContext) {
    const { renderingService } = context;

    renderingService.hooks.dirtycheck.tap(
      DirtyCheckPlugin.tag,
      (object: DisplayObject | null) => {
        if (object) {
          const { renderable } = object;
          const isDirty =
            renderable.dirty ||
            renderingService.disableDirtyRectangleRendering();

          if (isDirty) {
            return object;
          }
          return null;
        }

        return object;
      },
    );
  }
}
