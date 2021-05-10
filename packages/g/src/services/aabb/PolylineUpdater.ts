import { vec3 } from 'gl-matrix';
import { injectable } from 'inversify';
import { GeometryAABBUpdater } from '.';
import { AABB } from '../../shapes';
import { ShapeAttrs } from '../../types';

@injectable()
export class PolylineUpdater implements GeometryAABBUpdater {
  dependencies = ['width', 'height', 'lineWidth', 'anchor'];

  update(attributes: ShapeAttrs, aabb: AABB) {
    const { points = [], lineWidth = 0 } = attributes;
    const minX = Math.min(...points.map((point) => point[0]));
    const maxX = Math.max(...points.map((point) => point[0]));
    const minY = Math.min(...points.map((point) => point[1]));
    const maxY = Math.max(...points.map((point) => point[1]));
    // TODO: account for arrows
    const halfExtents = vec3.fromValues((maxX - minX) / 2, (maxY - minY) / 2, 0);
    const center = vec3.fromValues(minX + halfExtents[0], minY + halfExtents[1], 0);

    vec3.add(halfExtents, halfExtents, vec3.fromValues(lineWidth, lineWidth, 0));
    aabb.update(center, halfExtents);
  }
}
