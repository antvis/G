import { Entity, Matcher, System } from '@antv/g-ecs';
import { mat3, vec3 } from 'gl-matrix';
import { injectable } from 'inversify';
import { Geometry, Transform } from '../components';
import { Renderable } from '../components/Renderable';
import { getRotationScale } from '../utils/math';

@injectable()
export class AABB implements System {
  static tag = 's-aabb';
  static trigger = new Matcher().allOf(Renderable, Transform, Geometry);

  execute(entities: Entity[]) {
    entities.forEach((entity) => {
      const renderable = entity.getComponent(Renderable);
      const geometry = entity.getComponent(Geometry);
      const transform = entity.getComponent(Transform);

      // update mesh.aabb
      if (geometry.aabb && renderable.aabbDirty) {
        const { worldTransform } = transform;

        // apply transform to geometry.aabb
        const { center, halfExtents } = geometry.aabb;
        const transformedCenter = vec3.transformMat4(vec3.create(), center, worldTransform);

        const rotationScale = getRotationScale(worldTransform, mat3.create());
        const transformedHalfExtents = vec3.transformMat3(vec3.create(), halfExtents, rotationScale);

        renderable.aabb.update(transformedCenter, transformedHalfExtents);
        renderable.aabbDirty = false;
      }
    });
  }
}
