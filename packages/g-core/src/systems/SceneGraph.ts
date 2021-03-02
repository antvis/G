import { Entity, Matcher, System } from '@antv/g-ecs';
import { Transform as CTransform } from '../components/Transform';
import { Hierarchy as CHierarchy } from '../components/Hierarchy';
import { injectable } from 'inversify';

/**
 * update transform in scene graph
 */
@injectable()
export class SceneGraph extends System {
  static tag = 's-scenegraph';

  trigger() {
    return new Matcher().anyOf(CHierarchy, CTransform);
  }

  execute(entities: Entity[]) {
    entities.forEach((entity) => {
      const hierarchy = entity.getComponent(CHierarchy);
      const transform = entity.getComponent(CTransform);

      if (transform) {
        if (transform.isDirty() || transform.isLocalDirty()) {
          // TODO: update AABB in mesh component
          // this.setMeshAABBDirty(this.mesh.getComponentByEntity(entity));
          transform.updateTransform();
        }

        if (hierarchy) {
          const transformParent = hierarchy.parentEntity && hierarchy.parentEntity.getComponent(CTransform);
          if (transformParent) {
            transform.updateTransformWithParent(transformParent);
          }
        }
      }
    });
  }
}
