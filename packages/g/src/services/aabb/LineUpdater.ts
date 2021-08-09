import { vec3 } from 'gl-matrix';
import { injectable } from 'inversify';
import type { GeometryAABBUpdater } from '.';
import type { AABB } from '../../shapes';
import type { LineStyleProps } from '../../display-objects/Line';

@injectable()
export class LineUpdater implements GeometryAABBUpdater<LineStyleProps> {
  dependencies = ['x1', 'y1', 'x2', 'y2', 'lineWidth', 'anchor'];

  update(attributes: LineStyleProps, aabb: AABB) {
    const { x1, y1, x2, y2, lineWidth = 0, lineAppendWidth = 0, anchor = [0, 0] } = attributes;
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);

    const width = maxX - minX;
    const height = maxY - minY;

    // anchor is left-top by default
    attributes.x = minX;
    attributes.y = minY;
    attributes.width = width;
    attributes.height = height;

    const halfExtents = vec3.fromValues(width / 2, height / 2, 0);
    const center = vec3.fromValues(
      (1 - anchor[0] * 2) * halfExtents[0],
      (1 - anchor[1] * 2) * halfExtents[1],
      0,
    );

    vec3.add(
      halfExtents,
      halfExtents,
      vec3.fromValues(lineWidth + lineAppendWidth, lineWidth + lineAppendWidth, 0),
    );
    aabb.update(center, halfExtents);
  }
}
