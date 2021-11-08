import { inject, singleton } from 'mana-syringe';
import {
  DisplayObjectPool,
  RenderingService,
  RenderingPlugin,
  RenderingPluginContribution,
  SceneGraphService,
  PickingResult,
} from '@antv/g';

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
      const { clientX, clientY } = result.position;

      try {
        // @see https://developer.mozilla.org/zh-CN/docs/Web/API/Document/elementFromPoint
        const element = document.elementFromPoint(clientX, clientY);

        // find by id
        let target = null;
        // eg. g_svg_circle_345
        const id = element && element.getAttribute('id');
        if (id) {
          const index = id.lastIndexOf('_');
          target = this.displayObjectPool.getByName(id.substring(index + 1));
          if (!target.interactive) {
            target = null;
          }
        }

        result.picked = target;
      } catch (e) {
        result.picked = null;
      }
      return result;
    });
  }
}
