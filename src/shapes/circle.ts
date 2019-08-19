import * as Util from '@antv/util';
import Shape from '../core/shape';
import * as Inside from './util/inside';
import BBox from '../core/bbox';

class Circle extends Shape {
  canFill: boolean = true;
  canStroke: boolean = true;
  type: string = 'circle';

  getDefaultAttrs() {
    return {
      x: 0,
      y: 0,
      r: 0,
      lineWidth: 1
    };
  }

  isPointInPath(x: number, y: number): boolean {
    const attrs = this.attrs;
    const cx = attrs.x;
    const cy = attrs.y;
    const r = attrs.r;
    const lineWidth = this.getHitLineWidth();
    const fill = this.hasFill();
    const stroke = this.hasStroke();

    if (fill && stroke) {
      return Inside.circle(cx, cy, r, x, y) || Inside.arcline(cx, cy, r, 0, Math.PI * 2, false, lineWidth, x, y);
    }

    if (fill) {
      return Inside.circle(cx, cy, r, x, y);
    }

    if (stroke) {
      return Inside.arcline(cx, cy, r, 0, Math.PI * 2, false, lineWidth, x, y);
    }
    return false;
  }

  calculateBox(): BBox {
    const attrs = this.attrs;
    const cx = attrs.x;
    const cy = attrs.y;
    const r = attrs.r;
    const lineWidth = this.getHitLineWidth();
    const halfWidth = lineWidth / 2 + r;
    return BBox.fromRange(
      cx - halfWidth,
      cy - halfWidth,
      cx + halfWidth,
      cy + halfWidth
    );
  }

  createPath(context: CanvasRenderingContext2D): void {
    const attrs = this.attrs;
    const cx = attrs.x;
    const cy = attrs.y;
    const r = attrs.r;
    context.beginPath();
    context.arc(cx, cy, r, 0, Math.PI * 2, false);
    context.closePath();
  }
}

export default Circle;
