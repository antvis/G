import { vec3 } from 'gl-matrix';
import { injectable } from 'inversify';
import type { GeometryAABBUpdater } from '.';
import type { AABB } from '../../shapes';
import type { CircleStyleProps } from '../../display-objects/Circle';

@injectable()
export class CircleUpdater implements GeometryAABBUpdater<CircleStyleProps> {
  dependencies = ['r', 'lineWidth', 'lineAppendWidth', 'anchor'];

  update(attributes: CircleStyleProps, aabb: AABB) {
    const { r = 0, lineWidth = 0, lineAppendWidth = 0, anchor = [0.5, 0.5] } = attributes;
    const halfExtents = vec3.fromValues(r, r, 0);
    // anchor is center by default, don't account for lineWidth here
    const center = vec3.fromValues(
      (1 - anchor[0] * 2) * halfExtents[0],
      (1 - anchor[1] * 2) * halfExtents[1],
      0,
    );

    attributes.width = r * 2;
    attributes.height = r * 2;

    vec3.add(
      halfExtents,
      halfExtents,
      vec3.fromValues(lineWidth + lineAppendWidth, lineWidth + lineAppendWidth, 0),
    );
    aabb.update(center, halfExtents);
  }
}
