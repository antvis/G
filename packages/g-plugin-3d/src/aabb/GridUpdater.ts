import { vec3 } from 'gl-matrix';
import { injectable } from 'inversify';
import { GeometryAABBUpdater, AABB } from '@antv/g';
import { GridStyleProps } from '../Grid';

@injectable()
export class GridUpdater implements GeometryAABBUpdater<GridStyleProps> {
  dependencies = ['width', 'height', 'anchor'];

  update(attributes: GridStyleProps, aabb: AABB) {
    const { width = 0, height = 0, anchor = [0, 0] } = attributes;

    const halfExtents = vec3.fromValues(width / 2, height / 2, 1);
    const center = vec3.fromValues(
      (1 - anchor[0] * 2) * halfExtents[0],
      (1 - anchor[1] * 2) * halfExtents[1],
      (1 - anchor[1] * 2) * halfExtents[2]
    );

    aabb.update(center, halfExtents);
  }
}
