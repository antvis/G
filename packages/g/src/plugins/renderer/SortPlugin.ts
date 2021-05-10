import { Entity } from '@antv/g-ecs';
import { inject, injectable } from 'inversify';
import { Sortable } from '../../components';
import { DisplayObject } from '../../DisplayObject';
import { SceneGraphService } from '../../services';
import { RenderingService, RenderingPlugin } from '../../services/RenderingService';

/**
 * Sort by z-index
 */
@injectable()
export class SortPlugin implements RenderingPlugin {
  @inject(SceneGraphService)
  private sceneGraph: SceneGraphService;

  apply(renderer: RenderingService) {
    renderer.hooks.prepareEntities.tap('SortPlugin', (entities: Entity[], root: DisplayObject) => {
      if (!entities.length) {
        return [];
      }

      let rootDirty = false;
      entities.forEach((entity) => {
        const sortable = entity.getComponent(Sortable);
        if (sortable.dirty) {
          this.sceneGraph.sort(entity);
          rootDirty = true;
        }
      });

      const ids = this.sceneGraph.sort(root.getEntity(), rootDirty);
      return entities.sort((a, b) => ids.indexOf(a) - ids.indexOf(b));
    });
  }
}
