import { vec3 } from 'gl-matrix';
import { injectable } from 'inversify';
import type { GeometryAABBUpdater } from '.';
import type { AABB } from '../../shapes';
import type { CircleStyleProps } from '../../display-objects/Circle';

@injectable()
export class CircleUpdater implements GeometryAABBUpdater<CircleStyleProps> {
  dependencies = ['r', 'lineWidth', 'lineAppendWidth'];

  update(attributes: CircleStyleProps, aabb: AABB) {
    const { r = 0, lineWidth = 0, lineAppendWidth = 0 } = attributes;
    const center = vec3.create();
    const halfExtents = vec3.fromValues(r, r, 0);

    vec3.add(
      halfExtents,
      halfExtents,
      vec3.fromValues(lineWidth + lineAppendWidth, lineWidth + lineAppendWidth, 0),
    );
    aabb.update(center, halfExtents);
  }
}
