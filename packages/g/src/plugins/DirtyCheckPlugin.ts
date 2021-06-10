import { Entity } from '@antv/g-ecs';
import { inject, injectable } from 'inversify';
import { vec3 } from 'gl-matrix';
import { Renderable, SceneGraphNode } from '../components';
import { AABB } from '../shapes';
import { CanvasConfig } from '../types';
import { RenderingService, RenderingPlugin } from '../services/RenderingService';
import { RenderingContext } from '../services/RenderingContext';
import { SceneGraphService, SCENE_GRAPH_EVENT } from '../services/SceneGraphService';
import { DisplayObject } from '../DisplayObject';
import { DisplayObjectPool } from '../DisplayObjectPool';

/**
 * Filter dirty renderables and calculate the "dirty rectangle" which will be clear when frame began
 */
@injectable()
export class DirtyCheckPlugin implements RenderingPlugin {
  static tag = 'DirtyCheckPlugin';

  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  @inject(SceneGraphService)
  private sceneGraphService: SceneGraphService;

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  @inject(DisplayObjectPool)
  private displayObjectPool: DisplayObjectPool;

  private handleEntityAABBChanged = (entity: Entity) => {
    // if (entity.getComponent(SceneGraphNode).shadow) {
    //   return;
    // }

    const renderable = entity.getComponent(Renderable);

    if (!renderable.rBush) {
      renderable.rBush = this.renderingContext.rBush;
    }

    // insert node in RTree
    if (renderable.rBush && renderable.rBushNode) {
      renderable.rBush.remove(renderable.rBushNode);
    }

    if (renderable.aabb) {
      const [minX, minY] = renderable.aabb.getMin();
      const [maxX, maxY] = renderable.aabb.getMax();
      renderable.rBushNode = {
        name: entity.getName(),
        minX,
        minY,
        maxX,
        maxY,
      };
    }

    if (renderable.rBush) {
      renderable.rBush.insert(renderable.rBushNode);
    }
  };

  apply(renderer: RenderingService) {
    renderer.hooks.init.tap(DirtyCheckPlugin.tag, () => {
      this.sceneGraphService.on(SCENE_GRAPH_EVENT.AABBChanged, this.handleEntityAABBChanged);
    });

    renderer.hooks.destroy.tap(DirtyCheckPlugin.tag, () => {
      this.sceneGraphService.off(SCENE_GRAPH_EVENT.AABBChanged, this.handleEntityAABBChanged);
    });

    renderer.hooks.prepare.tap(DirtyCheckPlugin.tag, (objects: DisplayObject[]) => {
      let dirtyObjects = objects.filter(
        (object) => object.getEntity().getComponent(Renderable).dirty,
      );
      const enableDirtyRectangleRendering = this.canvasConfig.renderer.getConfig()
        .enableDirtyRectangleRendering;
      const dirtyRenderables = dirtyObjects.map((object) =>
        object.getEntity().getComponent(Renderable),
      );

      // skip rendering if nothing to redraw
      if (dirtyRenderables.length === 0) {
        this.renderingContext.dirtyRectangle = undefined;
        return [];
      }

      if (!enableDirtyRectangleRendering) {
        this.renderingContext.dirtyRectangle = undefined;
        return objects;
      }

      // TODO: use threshold when too much dirty renderables
      const dirtyRectangle = this.mergeDirtyRectangles(dirtyRenderables);
      this.renderingContext.removedAABBs.forEach((removedAABB) => {
        removedAABB && dirtyRectangle && dirtyRectangle.add(removedAABB);
      });
      this.renderingContext.removedAABBs = [];
      // set dirty rectangle manually
      this.renderingContext.dirtyRectangle = dirtyRectangle;

      if (!dirtyRectangle) {
        this.renderingContext.dirtyRectangle = undefined;
        return [];
      }

      // search in r-tree, get all affected nodes
      const [minX, minY] = dirtyRectangle.getMin();
      const [maxX, maxY] = dirtyRectangle.getMax();
      const rBushNodes = this.renderingContext.rBush.search({
        minX,
        minY,
        maxX,
        maxY,
      });

      dirtyObjects = rBushNodes.map(({ name }) => this.displayObjectPool.getByName(name));
      // .filter((object) => objects.indexOf(object)); // should

      return dirtyObjects;
    });

    // save dirty AABB in last frame
    renderer.hooks.afterRender.tap(
      DirtyCheckPlugin.tag,
      (dirtyObjects: DisplayObject[], objects: DisplayObject[]) => {
        const enableDirtyRectangleRendering = this.canvasConfig.renderer.getConfig()
          .enableDirtyRectangleRendering;

        if (enableDirtyRectangleRendering) {
          dirtyObjects.forEach((object) => {
            const entity = object.getEntity();
            const renderable = entity.getComponent(Renderable);
            if (!renderable.dirtyAABB) {
              renderable.dirtyAABB = new AABB();
            }
            // save last dirty aabb
            renderable.dirtyAABB.update(
              vec3.copy(vec3.create(), renderable.aabb.center),
              vec3.copy(vec3.create(), renderable.aabb.halfExtents),
            );
          });
        }

        // finish rendering, clear dirty flag
        objects.forEach((object) => {
          const entity = object.getEntity();
          const renderable = entity.getComponent(Renderable);
          if (renderable) {
            renderable.dirty = false;
          }
        });
      },
    );
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
