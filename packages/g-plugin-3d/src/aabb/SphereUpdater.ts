import { vec3 } from 'gl-matrix';
import { injectable } from 'inversify';
import { GeometryAABBUpdater, AABB, ShapeAttrs } from '@antv/g';

@injectable()
export class SphereUpdater implements GeometryAABBUpdater {
  dependencies = ['height', 'width', 'depth', 'anchor'];

  update(attributes: ShapeAttrs, aabb: AABB) {
    const { height = 0, width = 0, depth = 0, anchor = [0, 0] } = attributes;

    // anchor is left-top by default
    // attributes.x = minX + anchor[0] * width;
    // attributes.y = minY + anchor[1] * height;

    const halfExtents = vec3.fromValues(width / 2, height / 2, depth / 2);
    const center = vec3.fromValues(
      (1 - anchor[0] * 2) * halfExtents[0],
      (1 - anchor[1] * 2) * halfExtents[1],
      (1 - anchor[1] * 2) * halfExtents[2],
    );

    aabb.update(center, halfExtents);
  }
}
