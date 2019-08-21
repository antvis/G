import * as Util from '@antv/util';
import Shape from '../core/shape';
import * as Inside from './util/inside';
import isPointInPathByContext from './util/is-point-in-path-by-ctx';
import { PointType } from '../interface';
import BBox from '../core/bbox';

class Polygon extends Shape {
  canFill: boolean = true;
  canStroke: boolean = true;
  type: string = 'polygon';

  getDefaultAttrs() {
    return {
      points: null,
      lineWidth: 1,
    };
  }

  isPointInPath(x: number, y: number): boolean {
    const self = this;
    const fill = self.hasFill();
    const stroke = self.hasStroke();

    function _isPointInStroke() {
      const attrs = self.attrs;
      const points = attrs.points;
      if (points.length < 2) {
        return false;
      }
      const lineWidth = self.getHitLineWidth();
      const outPoints = points.slice(0);
      if (points.length >= 3) {
        outPoints.push(points[0]);
      }
      return Inside.polyline(outPoints, lineWidth, x, y);
    }
    if (fill && stroke) {
      return isPointInPathByContext(x, y, self) || _isPointInStroke();
    }

    if (fill) {
      return isPointInPathByContext(x, y, self);
    }

    if (stroke) {
      return _isPointInStroke();
    }
    return false;
  }

  calculateBox(): BBox {
    const self = this;
    const attrs = self.attrs;
    const points = attrs.points;
    const lineWidth = this.getHitLineWidth();
    if (!points || points.length === 0) {
      return null;
    }
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    Util.each(points, function(point) {
      const x = point[0];
      const y = point[1];
      if (x < minX) {
        minX = x;
      }
      if (x > maxX) {
        maxX = x;
      }

      if (y < minY) {
        minY = y;
      }

      if (y > maxY) {
        maxY = y;
      }
    });

    const halfWidth = lineWidth / 2;
    return BBox.fromRange(minX - halfWidth, minY - halfWidth, maxX + halfWidth, maxY + halfWidth);
  }

  createPath(context: CanvasRenderingContext2D): void {
    const self = this;
    const attrs = self.attrs;
    const points = attrs.points;
    if (points.length < 2) {
      return;
    }
    context = context || self.get('context');
    context.beginPath();
    Util.each(points, function(point: PointType, index: number) {
      if (index === 0) {
        context.moveTo(point[0], point[1]);
      } else {
        context.lineTo(point[0], point[1]);
      }
    });
    context.closePath();
  }
}

export default Polygon;
