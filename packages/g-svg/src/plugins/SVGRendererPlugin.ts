import { Entity } from '@antv/g-ecs';
import {
  AABB,
  CanvasConfig,
  ContextService,
  RenderingService,
  RenderingPlugin,
  ShapeRenderer,
  ShapeRendererFactory,
  SceneGraphNode,
  SHAPE,
} from '@antv/g-core';
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

  @inject(ShapeRendererFactory)
  private shapeRendererFactory: (type: SHAPE) => ShapeRenderer<CanvasRenderingContext2D> | null;

  /**
   * save the last dirty rect in DEBUG mode
   */
  private lastDirtyRectangle: Rect;

  apply(renderingService: RenderingService) {
    renderingService.hooks.beginFrame.tapPromise(
      'DirtyRectanglePlugin',
      async (entities: Entity[], dirtyAABB?: AABB) => {}
    );

    renderingService.hooks.endFrame.tapPromise('DirtyRectanglePlugin', async () => {});

    renderingService.hooks.renderFrame.tapPromise('DirtyRectanglePlugin', async (entities: Entity[]) => {
      const context = this.contextService.getContext();
      if (context) {
        for (const entity of entities) {
          const sceneGraphNode = entity.getComponent(SceneGraphNode);
          const renderer = this.shapeRendererFactory(sceneGraphNode.tagName);
          if (renderer) {
            renderer.render(context, entity);
          }
        }
      }
    });
  }

  private convertAABB2Rect(aabb: AABB): Rect {
    const min = aabb.getMin();
    const max = aabb.getMax();
    // expand the rectangle a bit to avoid artifacts
    // @see https://www.yuque.com/antv/ou292n/bi8nix#ExvCu
    const minX = Math.floor(min[0]);
    const minY = Math.floor(min[1]);
    const maxX = Math.ceil(max[0]);
    const maxY = Math.ceil(max[1]);
    const width = maxX - minX;
    const height = maxY - minY;

    return { x: minX, y: minY, width, height };
  }
}
