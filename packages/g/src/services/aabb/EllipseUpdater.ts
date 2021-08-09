import { vec3 } from 'gl-matrix';
import { injectable } from 'inversify';
import type { GeometryAABBUpdater } from '.';
import type { AABB } from '../../shapes';
import type { EllipseStyleProps } from '../../display-objects/Ellipse';

@injectable()
export class EllipseUpdater implements GeometryAABBUpdater<EllipseStyleProps> {
  dependencies = ['rx', 'ry', 'lineWidth', 'anchor'];

  update(attributes: EllipseStyleProps, aabb: AABB) {
    const { rx = 0, ry = 0, lineWidth = 0, lineAppendWidth = 0, anchor = [0.5, 0.5] } = attributes;
    const halfExtents = vec3.fromValues(rx, ry, 0);

    // anchor is center by default, don't account for lineWidth here
    const center = vec3.fromValues(
      (1 - anchor[0] * 2) * halfExtents[0],
      (1 - anchor[1] * 2) * halfExtents[1],
      0,
    );

    attributes.width = rx * 2;
    attributes.height = ry * 2;

    vec3.add(
      halfExtents,
      halfExtents,
      vec3.fromValues(lineWidth + lineAppendWidth, lineWidth + lineAppendWidth, 0),
    );
    aabb.update(center, halfExtents);
  }
}
