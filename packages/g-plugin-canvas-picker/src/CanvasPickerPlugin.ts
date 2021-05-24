import {
  SHAPE,
  DisplayObject,
  DisplayObjectPool,
  RenderingService,
  RenderingPlugin,
  RenderingContext,
  SceneGraphService,
  PickingResult,
} from '@antv/g';
import { inject, injectable } from 'inversify';

export const PointInPathPickerFactory = Symbol('PointInPathPicker');
export type PointInPathPicker = (
  displayObject: DisplayObject,
  point: {
    // lineWidth: number;
    x: number;
    y: number;
  }
) => boolean;

/**
 * pick shape(s) with Mouse/Touch event
 *
 * 1. find AABB with r-tree
 * 2. do math calculation with geometry in an accurate way
 */
@injectable()
export class CanvasPickerPlugin implements RenderingPlugin {
  static tag = 'CanvasPickerPlugin';

  @inject(SceneGraphService)
  protected sceneGraphService: SceneGraphService;

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  @inject(DisplayObjectPool)
  private displayObjectPool: DisplayObjectPool;

  @inject(PointInPathPickerFactory)
  private pointInPathPickerFactory: (tagName: SHAPE) => PointInPathPicker;

  apply(renderingService: RenderingService) {
    renderingService.hooks.pick.tap(CanvasPickerPlugin.tag, (result: PickingResult) => {
      const { x, y } = result.position;
      // query by AABB first with spatial index(r-tree)
      const rBushNodes = this.renderingContext.rBush.search({
        minX: x,
        minY: y,
        maxX: x,
        maxY: y,
      });

      const pickedDisplayObjects: DisplayObject[] = [];
      rBushNodes.forEach(({ name }: { name: string }) => {
        const displayObject = this.displayObjectPool.getByName(name);
        const { capture } = displayObject.getConfig();

        if (displayObject.isVisible() && capture) {
          // use picker for current shape's type
          const pick = this.pointInPathPickerFactory(displayObject.nodeType);
          if (pick) {
            if (pick(displayObject, { x, y })) {
              pickedDisplayObjects.push(displayObject);
            }
          } else {
            // use hit result, such as `Text`
            pickedDisplayObjects.push(displayObject);
          }
        }
      });

      // TODO: find group with max z-index
      pickedDisplayObjects.sort(this.sceneGraphService.sort);

      return {
        position: result.position,
        // return last picked
        picked: pickedDisplayObjects[pickedDisplayObjects.length - 1],
      };
    });
  }
}
