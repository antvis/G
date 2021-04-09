import { Entity, System } from '@antv/g-ecs';
import { inject, injectable, named } from 'inversify';
import { Renderable } from '../components';
import { AABB } from '../shapes';
import { CanvasConfig } from '../types';
import { RenderingService, RenderingPlugin } from '../services/RenderingService';
import { AABBCalculator } from '../systems/AABBCalculator';

/**
 * Filter dirty renderables and calculate the "dirty rectangle" which will be clear when frame began
 */
@injectable()
export class DirtyCheckPlugin implements RenderingPlugin {
  @inject(CanvasConfig)
  private canvasConfig: CanvasConfig;

  @inject(System)
  @named(AABBCalculator.tag)
  private aabbSystem: AABBCalculator;

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
      let dirtyRectangle: AABB | undefined;
      if (this.canvasConfig.dirtyRectangle?.enable) {
        // TODO: use threshold when too much dirty renderables
        const { rectangle, entities: affectedEntities } = this.aabbSystem.mergeDirtyRectangles(
          renderer.getRBush(),
          dirtyRenderables
        );

        if (!rectangle || affectedEntities.length === 0) {
          return [];
        }

        dirtyEntities = affectedEntities;
        dirtyRectangle = rectangle;
      }

      // set dirty rectangle manually
      renderer.setDirtyRectangle(dirtyRectangle);

      return dirtyEntities;
    });
  }
}
