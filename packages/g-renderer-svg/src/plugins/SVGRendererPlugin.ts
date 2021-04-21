import { Entity } from '@antv/g-ecs';
import { AABB, CanvasConfig, ContextService, RenderingService, RenderingPlugin, SceneGraphNode, SHAPE } from '@antv/g';
import { inject, injectable } from 'inversify';

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

@injectable()
export class SVGRendererPlugin implements RenderingPlugin {
  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  @inject(ContextService)
  private contextService: ContextService<CanvasRenderingContext2D>;

  /**
   * save the last dirty rect in DEBUG mode
   */
  private lastDirtyRectangle: Rect;

  apply(renderingService: RenderingService) {
    // renderingService.hooks.beginFrame.tapPromise(
    //   'DirtyRectanglePlugin',
    //   async (entities: Entity[], dirtyAABB?: AABB) => {}
    // );
    // renderingService.hooks.endFrame.tapPromise('DirtyRectanglePlugin', async () => {});
  }
}
