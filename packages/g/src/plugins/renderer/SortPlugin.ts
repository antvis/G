import { Entity } from '@antv/g-ecs';
import { inject, injectable } from 'inversify';
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
      const ids = this.sceneGraph.sort(root);
      return entities.sort((a, b) => ids.indexOf(a) - ids.indexOf(b));
    });
  }
}
