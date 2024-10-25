import type { Ellipse } from '../../display-objects/Ellipse';
import type { GeometryAABBUpdater } from './interfaces';

export class EllipseUpdater implements GeometryAABBUpdater {
  update(object: Ellipse) {
    const { cx = 0, cy = 0, rx = 0, ry = 0 } = object.attributes;

    return {
      cx,
      cy,
      hwidth: rx,
      hheight: ry,
    };
  }
}
