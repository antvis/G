import { Entity } from '@antv/g-ecs';
import { inject, injectable } from 'inversify';
import { Cullable, Geometry, Renderable, SceneGraphNode } from '../../components';
import { container } from '../../inversify.config';
import { SceneGraphService } from '../../services';
import { GeometryAABBUpdater } from '../../services/aabb';
import { DisplayObjectHooks, DisplayObjectPlugin } from '../../hooks';

/**
 * get called before appended to Canvas
 */
@injectable()
export class InitShapePlugin implements DisplayObjectPlugin {
  @inject(SceneGraphService)
  private sceneGraphService: SceneGraphService;

  apply() {
    DisplayObjectHooks.init.tap('InitPlugin', (entity: Entity) => {
      const sceneGraphNode = entity.getComponent(SceneGraphNode);

      // only shape can be rendered
      entity.addComponent(Renderable);
      entity.addComponent(Cullable);

      // calculate AABB for current geometry
      const geometry = entity.addComponent(Geometry);

      if (container.isBoundNamed(GeometryAABBUpdater, sceneGraphNode.tagName)) {
        const geometryUpdater = container.getNamed<GeometryAABBUpdater>(GeometryAABBUpdater, sceneGraphNode.tagName);
        geometryUpdater.update(sceneGraphNode.attributes, geometry.aabb);
        this.sceneGraphService.updateRenderableAABB(entity);

        // shape.emit(GROUP_EVENT.AABBChanged);
      }
    });
  }
}
