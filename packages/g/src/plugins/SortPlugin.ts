import { inject, injectable } from 'inversify';
import { DisplayObject } from '../DisplayObject';
import { SceneGraphService } from '../services';
import { RenderingService, RenderingPlugin } from '../services/RenderingService';

/**
 * Sort by z-index
 */
@injectable()
export class SortPlugin implements RenderingPlugin {
  @inject(SceneGraphService)
  private sceneGraphService: SceneGraphService;

  apply(renderer: RenderingService) {
    renderer.hooks.prepare.tap('SortPlugin', (objects: DisplayObject[], root: DisplayObject) => {
      if (!objects.length) {
        return [];
      }

      return objects.sort(this.sceneGraphService.sort);
    });
  }
}
