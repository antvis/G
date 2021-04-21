import { Entity } from '@antv/g-ecs';
import { inject, injectable } from 'inversify';
import { Geometry, Renderable, SceneGraphNode } from '../../components';
import { container } from '../../inversify.config';
import { SceneGraphService } from '../../services';
import { GeometryAABBUpdater } from '../../services/aabb';
import { DisplayObject } from '../../DisplayObject';
import { DisplayObjectHooks, DisplayObjectPlugin } from '../../hooks';

@injectable()
export class UpdateAttributePlugin implements DisplayObjectPlugin {
  @inject(SceneGraphService)
  private sceneGraphService: SceneGraphService;

  apply() {
    DisplayObjectHooks.changeAttribute.tap('UpdateAttributePlugin', (entity: Entity, name: string, value: any) => {
      const renderable = entity.getComponent(Renderable);
      const sceneGraphNode = entity.getComponent(SceneGraphNode);
      const geometry = entity.getComponent(Geometry);

      const [x, y] = this.sceneGraphService.getPosition(entity);

      // update value
      sceneGraphNode.attributes[name] = value;

      // update transform
      if (name === 'x') {
        this.sceneGraphService.setPosition(entity, value, y);
      } else if (name === 'y') {
        this.sceneGraphService.setPosition(entity, x, value);
      }

      // update geometry
      if (container.isBoundNamed(GeometryAABBUpdater, sceneGraphNode.tagName)) {
        const geometryUpdater = container.getNamed<GeometryAABBUpdater>(GeometryAABBUpdater, sceneGraphNode.tagName);
        // need to re-calc aabb
        if (geometryUpdater.dependencies.indexOf(name) > -1) {
          geometryUpdater.update(sceneGraphNode.attributes, geometry.aabb);
          this.sceneGraphService.updateRenderableAABB(entity);

          // shape.emit(GROUP_EVENT.AABBChanged);
        }
      }

      // redraw at next frame
      renderable.dirty = true;
    });
  }
}
