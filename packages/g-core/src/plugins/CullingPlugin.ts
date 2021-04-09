import { Entity } from '@antv/g-ecs';
import { injectable } from 'inversify';
import { Cullable, Visible } from '../components';
import { RenderingService, RenderingPlugin } from '../services/RenderingService';

@injectable()
export class CullingPlugin implements RenderingPlugin {
  apply(renderer: RenderingService) {
    renderer.hooks.prepareEntities.tap('CullingPlugin', (entities: Entity[]) => {
      // filter by renderable.visible && cullable.visible
      // do culling
      return entities.filter((entity) => {
        const cullable = entity.getComponent(Cullable);
        const visible = entity.getComponent(Visible);
        return visible.visible && (!cullable || cullable.visible);
      });
    });
  }
}
