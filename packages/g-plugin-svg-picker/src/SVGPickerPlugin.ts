import { inject, singleton } from 'mana-syringe';
import type { RenderingService, RenderingPlugin, PickingResult, DisplayObject } from '@antv/g';
import { DisplayObjectPool, RenderingPluginContribution, SceneGraphService } from '@antv/g';

/**
 * pick shape(s) with Mouse/Touch event
 *
 * 1. find AABB with r-tree
 * 2. use elementFromPoint
 */
@singleton({ contrib: RenderingPluginContribution })
export class SVGPickerPlugin implements RenderingPlugin {
  static tag = 'SVGPickerPlugin';

  @inject(SceneGraphService)
  protected sceneGraphService: SceneGraphService;

  @inject(DisplayObjectPool)
  private displayObjectPool: DisplayObjectPool;

  apply(renderingService: RenderingService) {
    renderingService.hooks.pick.tap(SVGPickerPlugin.tag, (result: PickingResult) => {
      const {
        topmost,
        position: { clientX, clientY },
      } = result;

      try {
        const targets: DisplayObject[] = [];
        // @see https://developer.mozilla.org/zh-CN/docs/Web/API/Document/elementsFromPoint
        for (const element of document.elementsFromPoint(clientX, clientY)) {
          // eg. g_svg_circle_345
          const id = element && element.getAttribute('id');
          if (id && id.startsWith('g_')) {
            const index = id.lastIndexOf('_');
            const target = this.displayObjectPool.getByEntity(Number(id.substring(index + 1)));

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
    });
  }
}
