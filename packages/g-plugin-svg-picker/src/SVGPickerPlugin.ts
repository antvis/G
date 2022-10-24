import type {
  DisplayObject,
  PickingResult,
  RenderingPlugin,
  RenderingPluginContext,
} from '@antv/g-lite';
import { runtime } from '@antv/g-lite';
import { G_SVG_PREFIX } from '@antv/g-plugin-svg-renderer';

/**
 * pick shape(s) with Mouse/Touch event
 *
 * 1. find AABB with r-tree
 * 2. use elementFromPoint
 */
export class SVGPickerPlugin implements RenderingPlugin {
  static tag = 'SVGPicker';

  apply(context: RenderingPluginContext) {
    const {
      config: { document: doc },
      renderingService,
    } = context;

    renderingService.hooks.pick.tapPromise(SVGPickerPlugin.tag, async (result: PickingResult) => {
      return this.pick(doc, result);
    });

    renderingService.hooks.pickSync.tap(SVGPickerPlugin.tag, (result: PickingResult) => {
      return this.pick(doc, result);
    });
  }

  private pick(doc: Document, result: PickingResult) {
    const {
      topmost,
      position: { clientX, clientY },
    } = result;

    try {
      const targets: DisplayObject[] = [];
      // @see https://developer.mozilla.org/zh-CN/docs/Web/API/Document/elementsFromPoint
      for (const element of (doc || document).elementsFromPoint(clientX, clientY)) {
        // eg. g_svg_circle_345
        const id = element && element.getAttribute('id');
        if (id && id.startsWith(G_SVG_PREFIX)) {
          const index = id.lastIndexOf('-');
          const target = runtime.displayObjectPool.getByEntity(id.substring(index + 1));

          // don't need to account for `visibility` since DOM API already does
          if (target && target.isInteractive()) {
            targets.push(target);

            if (topmost) {
              result.picked = targets;
              return result;
            }
          }
        }
      }

      result.picked = targets;
    } catch (e) {
      result.picked = [];
    }
    return result;
  }
}
