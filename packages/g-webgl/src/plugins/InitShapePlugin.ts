import { Entity } from '@antv/g-ecs';
import { inject, injectable } from 'inversify';
import { SceneGraphNode, Shape, ShapePlugin } from '@antv/g-core';
import { Geometry3D } from '../components/Geometry3D';
import { Material3D } from '../components/Material3D';
import { Renderable3D } from '../components/Renderable3D';
import { PickingIdGenerator } from './PickingIdGenerator';

@injectable()
export class InitShapePlugin implements ShapePlugin {
  @inject(PickingIdGenerator)
  private pickingIdGenerator: PickingIdGenerator;

  apply(shape: Shape) {
    shape.hooks.init.tap('InitPlugins', (entity: Entity) => {
      const subRenderable = entity.addComponent(Renderable3D);
      // add geometry & material required by Renderable3D
      entity.addComponent(Geometry3D);
      entity.addComponent(Material3D);

      // add picking id
      subRenderable.pickingId = this.pickingIdGenerator.getId();

      // instancing
      const instanceEntity = entity.getComponent(SceneGraphNode).attributes.instanceEntity;
      // TODO: check whether current engine supports instanced array?
      if (instanceEntity) {
        const source = instanceEntity.getComponent(Renderable3D);
        const geometry = instanceEntity.getComponent(Geometry3D);

        subRenderable.source = source;
        subRenderable.sourceEntity = instanceEntity;
        source.instances.push(subRenderable);
        source.instanceEntities.push(entity);
        source.instanceDirty = true;
        geometry.reset();
      }
    });
  }
}
