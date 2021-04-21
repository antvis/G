import { Entity, EntityManager } from '@antv/g-ecs';
import { inject, injectable } from 'inversify';
import { Renderable } from '../../components';
import { AABB } from '../../shapes';
import { CanvasConfig } from '../../types';
import { RenderingService, RenderingPlugin } from '../../services/RenderingService';

/**
 * Filter dirty renderables and calculate the "dirty rectangle" which will be clear when frame began
 */
@injectable()
export class DirtyCheckPlugin implements RenderingPlugin {
  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  @inject(EntityManager)
  private entityManager: EntityManager;

  apply(renderer: RenderingService) {
    renderer.hooks.prepareEntities.tap('DirtyCheckPlugin', (entities: Entity[]) => {
      const dirtyRenderables = entities
        .map((entity) => entity.getComponent(Renderable))
        .filter((renderable) => renderable.dirty);

      // skip rendering if nothing to redraw
      if (dirtyRenderables.length === 0) {
        return [];
      }

      // use dirty rectangle or refresh all?
      let dirtyEntities: Entity[] = entities;
      // if (this.canvasConfig.dirtyRectangle?.enable) {
      //   // TODO: use threshold when too much dirty renderables
      //   const dirtyRectangle = this.mergeDirtyRectangles(dirtyRenderables);
      //   // set dirty rectangle manually
      //   renderer.context.dirtyRectangle = dirtyRectangle;

      //   if (!dirtyRectangle) {
      //     return [];
      //   }

      //   // search in r-tree, get all affected nodes
      //   const [minX, minY] = dirtyRectangle.getMin();
      //   const [maxX, maxY] = dirtyRectangle.getMax();
      //   const rBushNodes = renderer.context.rBush.search({
      //     minX,
      //     minY,
      //     maxX,
      //     maxY,
      //   });

      //   dirtyEntities = rBushNodes.map(({ name }) => this.entityManager.getEntityByName(name));

      //   console.log(dirtyEntities);
      //   console.log(dirtyRectangle);
      // }

      return dirtyEntities;
    });
  }

  /**
   * TODO: merge dirty rectangles with some strategies.
   * For now, we just simply merge all the rectangles into one.
   * @see https://idom.me/articles/841.html
   */
  private mergeDirtyRectangles(dirtyRenderables: Renderable[]): AABB | undefined {
    // merge into a big AABB
    let dirtyRectangle: AABB | undefined;
    dirtyRenderables.forEach(({ aabb, dirtyAABB }) => {
      if (aabb) {
        if (!dirtyRectangle) {
          dirtyRectangle = new AABB(aabb.center, aabb.halfExtents);
        } else {
          dirtyRectangle.add(aabb);
        }
      }
      if (dirtyAABB) {
        if (!dirtyRectangle) {
          dirtyRectangle = new AABB(dirtyAABB.center, dirtyAABB.halfExtents);
        } else {
          dirtyRectangle.add(dirtyAABB);
        }
      }
    });

    return dirtyRectangle;
  }
}
