import { Entity, Matcher, System } from '@antv/g-ecs';
import { Transform as CTransform } from '../components/Transform';
import { Hierarchy as CHierarchy } from '../components/Hierarchy';

export class Hierarchy extends System {
  static tag = 's-scenegraph';

  trigger() {
    return new Matcher().anyOf(CHierarchy);
  }

  execute(entities: Entity[]) {
    entities.forEach((entity) => {
      const hierarchy = entity.getComponent(CHierarchy);
      const transformChild = entity.getComponent(CTransform);
      const transformParent = hierarchy.parentEntity && hierarchy.parentEntity.getComponent(CTransform);
      if (transformChild && transformParent) {
        transformChild.updateTransformWithParent(transformParent);
      }
    });
  }
}
