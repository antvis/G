import * as Util from '@antv/util';
import Shape from '../core/shape';
import { parseRadius } from '../util/format';
import * as Inside from './util/inside';
import isPointInPathByContext from './util/is-point-in-path-by-ctx';
import BBox from '../core/bbox';

class Rect extends Shape {
  canFill: boolean = true;
  canStroke: boolean = true;
  type: string = 'rect';

  getDefaultAttrs() {
    return {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      radius: 0,
      lineWidth: 1,
    };
  }

  isPointInPath(x: number, y: number): boolean {
    const self = this;
    const fill = self.hasFill();
    const stroke = self.hasStroke();

    function _isPointInStroke() {
      const attrs = self.attrs;
      const rx = attrs.x;
      const ry = attrs.y;
      const width = attrs.width;
      const height = attrs.height;
      const radius = attrs.radius;
      const lineWidth = self.getHitLineWidth();

      if (radius === 0) {
        const halfWidth = lineWidth / 2;
        return (
          Inside.line(rx - halfWidth, ry, rx + width + halfWidth, ry, lineWidth, x, y) ||
          Inside.line(rx + width, ry - halfWidth, rx + width, ry + height + halfWidth, lineWidth, x, y) ||
          Inside.line(rx + width + halfWidth, ry + height, rx - halfWidth, ry + height, lineWidth, x, y) ||
          Inside.line(rx, ry + height + halfWidth, rx, ry - halfWidth, lineWidth, x, y)
        );
      }

      return (
        Inside.line(rx + radius, ry, rx + width - radius, ry, lineWidth, x, y) ||
        Inside.line(rx + width, ry + radius, rx + width, ry + height - radius, lineWidth, x, y) ||
        Inside.line(rx + width - radius, ry + height, rx + radius, ry + height, lineWidth, x, y) ||
        Inside.line(rx, ry + height - radius, rx, ry + radius, lineWidth, x, y) ||
        Inside.arcline(rx + width - radius, ry + radius, radius, 1.5 * Math.PI, 2 * Math.PI, false, lineWidth, x, y) ||
        Inside.arcline(rx + width - radius, ry + height - radius, radius, 0, 0.5 * Math.PI, false, lineWidth, x, y) ||
        Inside.arcline(rx + radius, ry + height - radius, radius, 0.5 * Math.PI, Math.PI, false, lineWidth, x, y) ||
        Inside.arcline(rx + radius, ry + radius, radius, Math.PI, 1.5 * Math.PI, false, lineWidth, x, y)
      );
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
    const x = attrs.x;
    const y = attrs.y;
    const width = attrs.width;
    const height = attrs.height;
    const lineWidth = this.getHitLineWidth();

    const halfWidth = lineWidth / 2;
    return BBox.fromRange(x - halfWidth, y - halfWidth, x + width + halfWidth, y + height + halfWidth);
  }

  createPath(context: CanvasRenderingContext2D): void {
    const self = this;
    const attrs = self.attrs;
    const x = attrs.x;
    const y = attrs.y;
    const width = attrs.width;
    const height = attrs.height;
    const radius = attrs.radius;
    context = context || self.get('context');

    context.beginPath();
    if (radius === 0) {
      // 改成原生的rect方法
      context.rect(x, y, width, height);
    } else {
      const r = parseRadius(radius);
      context.moveTo(x + r.r1, y);
      context.lineTo(x + width - r.r2, y);
      r.r2 !== 0 && context.arc(x + width - r.r2, y + r.r2, r.r2, -Math.PI / 2, 0);
      context.lineTo(x + width, y + height - r.r3);
      r.r3 !== 0 && context.arc(x + width - r.r3, y + height - r.r3, r.r3, 0, Math.PI / 2);
      context.lineTo(x + r.r4, y + height);
      r.r4 !== 0 && context.arc(x + r.r4, y + height - r.r4, r.r4, Math.PI / 2, Math.PI);
      context.lineTo(x, y + r.r1);
      r.r1 !== 0 && context.arc(x + r.r1, y + r.r1, r.r1, Math.PI, Math.PI * 1.5);
      context.closePath();
    }
  }
}

export default Rect;
