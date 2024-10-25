import type { Circle } from '../../display-objects/Circle';
import type { GeometryAABBUpdater } from './interfaces';

export class CircleUpdater implements GeometryAABBUpdater {
  update(object: Circle) {
    const { cx = 0, cy = 0, r = 0 } = object.attributes;

    return {
      cx,
      cy,
      hwidth: r,
      hheight: r,
    };
  }
}
