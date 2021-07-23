import { vec3 } from 'gl-matrix';
import { injectable } from 'inversify';
import type { GeometryAABBUpdater } from '.';
import type { AABB } from '../../shapes';
import type { EllipseStyleProps } from '../../shapes-export';

@injectable()
export class EllipseUpdater implements GeometryAABBUpdater<EllipseStyleProps> {
  dependencies = ['rx', 'ry', 'lineWidth'];

  update(attributes: EllipseStyleProps, aabb: AABB) {
    const { rx = 0, ry = 0, lineWidth = 0, lineAppendWidth = 0 } = attributes;
    const center = vec3.create();
    const halfExtents = vec3.fromValues(rx, ry, 0);

    vec3.add(
      halfExtents,
      halfExtents,
      vec3.fromValues(lineWidth + lineAppendWidth, lineWidth + lineAppendWidth, 0),
    );
    aabb.update(center, halfExtents);
  }
}
