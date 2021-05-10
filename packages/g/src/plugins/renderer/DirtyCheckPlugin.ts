import { Entity, EntityManager } from '@antv/g-ecs';
import { inject, injectable } from 'inversify';
import { Renderable } from '../../components';
import { AABB } from '../../shapes';
import { CanvasConfig, RendererConfig } from '../../types';
import { RenderingService, RenderingPlugin } from '../../services/RenderingService';
import { RenderingContext } from '../../services/RenderingContext';
import { SceneGraphService, SCENE_GRAPH_EVENT } from '../../services/SceneGraphService';
import { vec3 } from 'gl-matrix';

/**
 * Filter dirty renderables and calculate the "dirty rectangle" which will be clear when frame began
 */
@injectable()
export class DirtyCheckPlugin implements RenderingPlugin {
  static tag = 'DirtyCheckPlugin';

  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  @inject(EntityManager)
  private entityManager: EntityManager;

  @inject(SceneGraphService)
  private sceneGraphService: SceneGraphService;

  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  private handleEntityAABBChanged = (entity: Entity) => {
    const renderable = entity.getComponent(Renderable);

    if (!renderable.rBush) {
      renderable.rBush = this.renderingContext.rBush;
    }

    // insert node in RTree
    if (renderable.rBush && renderable.rBushNode) {
      renderable.rBush.remove(renderable.rBushNode);
    }
    const [minX, minY] = renderable.aabb.getMin();
    const [maxX, maxY] = renderable.aabb.getMax();
    renderable.rBushNode = {
      name: entity.getName(),
      minX,
      minY,
      maxX,
      maxY,
    };

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

    renderer.hooks.prepareEntities.tap(DirtyCheckPlugin.tag, (entities: Entity[]) => {
      let dirtyEntities: Entity[] = entities.filter((entity) => entity.getComponent(Renderable).dirty);

      const dirtyRenderables = dirtyEntities.map((entity) => entity.getComponent(Renderable));

      // skip rendering if nothing to redraw
      if (dirtyRenderables.length === 0) {
        this.renderingContext.dirtyRectangle = undefined;
        return [];
      }

      if (!(this.canvasConfig?.renderer as RendererConfig).enableDirtyRectangleRendering) {
        this.renderingContext.dirtyRectangle = undefined;
        return entities;
      }

      // TODO: use threshold when too much dirty renderables
      const dirtyRectangle = this.mergeDirtyRectangles(dirtyRenderables);
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

      dirtyEntities = rBushNodes.map(({ name }) => this.entityManager.getEntityByName(name));
      return dirtyEntities;
    });

    // save dirty AABB in last frame
    renderer.hooks.endFrame.tap(DirtyCheckPlugin.tag, (dirtyEntities: Entity[], entities: Entity[]) => {
      dirtyEntities.forEach((entity) => {
        const renderable = entity.getComponent(Renderable);
        if (!renderable.dirtyAABB) {
          renderable.dirtyAABB = new AABB();
        }
        // save last dirty aabb
        renderable.dirtyAABB.update(
          vec3.copy(vec3.create(), renderable.aabb.center),
          vec3.copy(vec3.create(), renderable.aabb.halfExtents)
        );
      });

      // finish rendering, clear dirty flag
      entities.forEach((e) => {
        const renderable = e.getComponent(Renderable);
        if (renderable) {
          renderable.dirty = false;
        }
      });
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
