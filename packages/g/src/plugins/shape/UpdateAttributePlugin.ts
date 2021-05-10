import { Entity } from '@antv/g-ecs';
import { inject, injectable } from 'inversify';
import { Geometry, Renderable, SceneGraphNode, Sortable } from '../../components';
import { SceneGraphService } from '../../services';
import { GeometryAABBUpdater, GeometryUpdaterFactory } from '../../services/aabb';
import { DisplayObjectHooks, DisplayObjectPlugin } from '../../hooks';
import { SHAPE } from '../../types';

@injectable()
export class UpdateAttributePlugin implements DisplayObjectPlugin {
  @inject(SceneGraphService)
  private sceneGraphService: SceneGraphService;

  @inject(GeometryUpdaterFactory)
  private geometryUpdaterFactory: (tagName: SHAPE) => GeometryAABBUpdater | null;

  apply() {
    DisplayObjectHooks.changeAttribute.tapPromise(
      'UpdateAttributePlugin',
      async (entity: Entity, name: string, value: any) => {
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
        } else if (name === 'z-index') {
          const sortable = entity.getComponent(Sortable);
          sortable.zIndex = value;

          const parentRenderable = sceneGraphNode.parent?.getComponent(Renderable);
          const parentSortable = sceneGraphNode.parent?.getComponent(Sortable);
          if (parentRenderable) {
            parentRenderable.dirty = true;
          }

          // need re-sort parent
          if (parentSortable) {
            parentSortable.dirty = true;
          }
        }

        const geometryUpdater = this.geometryUpdaterFactory(sceneGraphNode.tagName);
        if (geometryUpdater && geometryUpdater.dependencies.indexOf(name) > -1) {
          geometryUpdater.update(sceneGraphNode.attributes, geometry.aabb);
          this.sceneGraphService.updateRenderableAABB(entity);
        }

        // redraw at next frame
        renderable.dirty = true;
      }
    );
  }
}
