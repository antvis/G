import { Entity } from '@antv/g-ecs';
import {
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
import { ElementSVG } from '../components/ElementSVG';

/**
 * pick shape(s) with Mouse/Touch event
 *
 * 1. find AABB with r-tree
 * 2. use elementFromPoint
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
    renderingService.hooks.pick.tap(PickingPlugin.tag, (result: PickingResult) => {
      const { x, y, clientX, clientY } = result.position;

      // query by AABB first with spatial index(r-tree)
      const rBushNodes = this.renderingContext.rBush.search({
        minX: x,
        minY: y,
        maxX: x,
        maxY: y,
      });

      // @see https://developer.mozilla.org/zh-CN/docs/Web/API/Document/elementFromPoint
      const element = document.elementFromPoint(clientX, clientY);

      let target = null;
      rBushNodes.forEach(({ name }: { name: string }) => {
        const displayObject = this.displayObjectPool.getByName(name);

        const { capture } = displayObject.getConfig();

        if (displayObject.isVisible() && capture) {
          if (element && element.isEqualNode(displayObject.getEntity().getComponent(ElementSVG).$el)) {
            target = displayObject;
          }
        }
      });

      return {
        position: result.position,
        picked: target,
      };
    });
  }
}
