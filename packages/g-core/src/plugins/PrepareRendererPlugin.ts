import { Entity } from '@antv/g-ecs';
import { inject, injectable } from 'inversify';
import { Renderable, SceneGraphNode } from '../components';
import { GROUP_EVENT } from '../Group';
import { GroupPool } from '../GroupPool';
import { ContextService } from '../services';
import { RenderingService, RenderingPlugin } from '../services/RenderingService';
import { ShapeRenderer, ShapeRendererFactory } from '../systems';
import { SHAPE } from '../types';

@injectable()
export class PrepareRendererPlugin implements RenderingPlugin {
  @inject(GroupPool)
  private groupPool: GroupPool;

  @inject(ContextService)
  private contextService: ContextService<unknown>;

  @inject(ShapeRendererFactory)
  private shapeRendererFactory: (type: SHAPE) => ShapeRenderer<unknown> | null;

  apply(renderer: RenderingService) {
    renderer.hooks.prepareEntities.tapPromise('PrepareRendererPlugin', async (entities: Entity[]) => {
      const initedEntities = await Promise.all(
        entities.map(async (entity) => {
          if (entity.hasComponent(Renderable)) {
            const renderable = entity.getComponent(Renderable);

            if (renderable.inited) {
              return entity;
            }

            const sceneGraphNode = entity.getComponent(SceneGraphNode);
            const shapeRenderer = this.shapeRendererFactory(sceneGraphNode.tagName);
            if (shapeRenderer) {
              await shapeRenderer.init(this.contextService.getContext(), entity);
            }

            renderable.dirty = true;
            renderable.rBush = renderer.getRBush();
            renderable.inited = true;

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

            const shape = this.groupPool.getByName(entity.getName());
            shape.on(GROUP_EVENT.AttributeChanged, (entity, name, value) => {
              renderer.hooks.changeAttribute.call(entity, name, value);
            });

            return entity;
          }

          return null;
        })
      );

      return initedEntities.filter((e) => e) as Entity[];
    });
  }
}
