import { vec3 } from 'gl-matrix';
import { injectable } from 'inversify';
import { GeometryAABBUpdater, AABB } from '@antv/g';
import { SphereStyleProps } from '../Sphere';

@injectable()
export class SphereUpdater implements GeometryAABBUpdater<SphereStyleProps> {
  dependencies = ['height', 'width', 'depth', 'anchor'];

  update(attributes: SphereStyleProps, aabb: AABB) {
    const { height = 0, width = 0, depth = 0 } = attributes;

    return {
      width,
      height,
      depth,
    };
  }
}
