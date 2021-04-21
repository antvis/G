import { vec3 } from 'gl-matrix';
import { injectable } from 'inversify';
import { GeometryAABBUpdater } from '.';
import { AABB } from '../../shapes';
import { ShapeAttrs } from '../../types';

@injectable()
export class RectUpdater implements GeometryAABBUpdater {
  dependencies = ['width', 'height', 'lineWidth', 'anchor'];

  update(attributes: ShapeAttrs, aabb: AABB) {
    const { width = 0, height = 0, lineWidth = 0, lineAppendWidth = 0, anchor = [0, 0] } = attributes;
    // anchor is left-top by default
    const halfExtents = vec3.fromValues(width / 2, height / 2, 0);
    const center = vec3.fromValues((1 - anchor[0] * 2) * halfExtents[0], (1 - anchor[1] * 2) * halfExtents[1], 0);

    vec3.add(halfExtents, halfExtents, vec3.fromValues(lineWidth + lineAppendWidth, lineWidth + lineAppendWidth, 0));
    aabb.update(center, halfExtents);
  }
}
