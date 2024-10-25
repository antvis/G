import { isArray } from '@antv/util';
import type { Polyline } from '../../display-objects';
import type { GeometryAABBUpdater } from './interfaces';

export class PolylineUpdater implements GeometryAABBUpdater {
  update(object: Polyline) {
    const points = object.parsedStyle?.points?.points;
    if (points && isArray(points)) {
      // FIXME: account for miter lineJoin
      const minX = Math.min(...points.map((point) => point[0]));
      const maxX = Math.max(...points.map((point) => point[0]));
      const minY = Math.min(...points.map((point) => point[1]));
      const maxY = Math.max(...points.map((point) => point[1]));

      const width = maxX - minX;
      const height = maxY - minY;
      const hwidth = width / 2;
      const hheight = height / 2;

      return {
        cx: minX + hwidth,
        cy: minY + hheight,
        hwidth,
        hheight,
      };
    }
    return {
      cx: 0,
      cy: 0,
      hwidth: 0,
      hheight: 0,
    };
  }
}
