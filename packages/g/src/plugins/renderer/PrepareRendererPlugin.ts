import { Entity } from '@antv/g-ecs';
import { inject, injectable } from 'inversify';
import { Geometry, Renderable } from '../../components';
import { DisplayObjectPool } from '../../DisplayObjectPool';
import { DisplayObjectHooks } from '../../hooks';
import { ContextService } from '../../services';
import { RenderingService, RenderingPlugin } from '../../services/RenderingService';
import { CanvasConfig } from '../../types';

@injectable()
export class PrepareRendererPlugin implements RenderingPlugin {
  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  @inject(ContextService)
  private contextService: ContextService<unknown>;

  @inject(DisplayObjectPool)
  private displayObjectPool: DisplayObjectPool;

  apply(renderer: RenderingService) {
    renderer.hooks.prepareEntities.tapPromise('PrepareRendererPlugin', async (entities: Entity[]) => {
      const initedEntities = await Promise.all(
        entities.map(async (entity) => {
          if (entity.hasComponent(Renderable)) {
            const renderable = entity.getComponent(Renderable);

            // trigger hooks
            if (!renderable.didMount) {
              const object = this.displayObjectPool.getByName(entity.getName());

              // shape.hooks.changeAttribute.tapAsync();

              // shape.on(GROUP_EVENT.AABBChanged, () => {
              //   if (!renderable.rBush) {
              //     renderable.rBush = renderer.context.rBush;
              //   }

              //   // insert node in RTree
              //   if (renderable.rBush && renderable.rBushNode) {
              //     renderable.rBush.remove(renderable.rBushNode);
              //   }
              //   const [minX, minY] = renderable.aabb.getMin();
              //   const [maxX, maxY] = renderable.aabb.getMax();
              //   renderable.rBushNode = {
              //     name: entity.getName(),
              //     minX,
              //     minY,
              //     maxX,
              //     maxY,
              //   };

              //   if (renderable.rBush) {
              //     renderable.rBush.insert(renderable.rBushNode);
              //   }
              // });
              // shape.emit(GROUP_EVENT.AABBChanged);

              await DisplayObjectHooks.mounted.promise(
                this.canvasConfig.renderer!,
                this.contextService.getContext(),
                entity
              );
              renderable.didMount = true;
              renderable.dirty = true;
            }

            return entity;
          }

          return null;
        })
      );

      return initedEntities.filter((e) => e) as Entity[];
    });

    // renderer.hooks.destroy
  }
}
