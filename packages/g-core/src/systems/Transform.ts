import { Entity, Matcher, System } from '@antv/g-ecs';
import { Transform as CTransform } from '../components/Transform';

export class Transform extends System {
  static tag = 's-transform';

  trigger() {
    return new Matcher().allOf(CTransform);
  }

  execute(entities: Entity[]) {
    entities.forEach((entity) => {
      const transform = entity.getComponent(CTransform);
      if (transform.isDirty() || transform.isLocalDirty()) {
        // TODO: update AABB in mesh component
        // this.setMeshAABBDirty(this.mesh.getComponentByEntity(entity));
        transform.updateTransform();
      }
    });
  }
}
