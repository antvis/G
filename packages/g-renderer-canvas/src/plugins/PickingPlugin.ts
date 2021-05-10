import { Entity } from '@antv/g-ecs';
import {
  container,
  DisplayObject,
  DisplayObjectPool,
  CanvasConfig,
  ContextService,
  RenderingService,
  RenderingPlugin,
  RenderingContext,
  SceneGraphService,
  PickingResult,
} from '@antv/g';
import { inject, injectable } from 'inversify';
import { PointInPathPicker } from '../shapes/picking';

/**
 * pick shape(s) with Mouse/Touch event
 *
 * 1. find AABB with r-tree
 * 2. do math calculation with geometry in an accurate way
 */
@injectable()
export class PickingPlugin implements RenderingPlugin {
  static tag = 'PickingPlugin';

  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  @inject(SceneGraphService)
  protected sceneGraphService: SceneGraphService;

  @inject(ContextService)
  private contextService: ContextService<CanvasRenderingContext2D>;

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  @inject(DisplayObjectPool)
  private displayObjectPool: DisplayObjectPool;

  apply(renderingService: RenderingService) {
    // const handleMouseMove = (ev: Event) => {
    //   renderingService.pick(ev);
    // };

    // renderingService.hooks.init.tap(PickingPlugin.tag, async (entities: Entity[]) => {
    //   const $canvas = this.contextService.getCanvas();

    //   $canvas.addEventListener('mousemove', handleMouseMove);
    // });

    // renderingService.hooks.destroy.tap(PickingPlugin.tag, async () => {
    //   const $canvas = this.contextService.getCanvas();

    //   $canvas.removeEventListener('mousemove', handleMouseMove);
    // });

    renderingService.hooks.pick.tap(PickingPlugin.tag, (result: PickingResult) => {
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
          if (container.isBoundNamed(PointInPathPicker, displayObject.nodeType)) {
            const pick = container.getNamed(PointInPathPicker, displayObject.nodeType);

            if (pick && pick(displayObject, { x, y })) {
              pickedDisplayObjects.push(displayObject);
            }
          } else {
            // use hit result, such as `Text`
            pickedDisplayObjects.push(displayObject);
          }
        }
      });

      // TODO: find group with max z-index
      const ids = this.sceneGraphService.sort(this.renderingContext.root.getEntity(), true);
      pickedDisplayObjects.sort((a, b) => ids.indexOf(b.getEntity()) - ids.indexOf(a.getEntity()));

      return {
        position: result.position,
        picked: pickedDisplayObjects[0],
      };
    });
  }
}
