import * as Util from '@antv/util';
import Shape from '../core/shape';
const ArcMath = require('./math/arc');
import * as Arrow from './util/arrow';
import * as Inside from './util/inside';
import { PointType } from '../interface';
import BBox from '../core/bbox';

function _getArcX(x: number, radius: number, angle: number): number {
  return x + (radius * Math.cos(angle));
}
function _getArcY(y: number, radius: number, angle: number): number {
  return y + (radius * Math.sin(angle));
}

class Arc extends Shape {
  canStroke: boolean = true;
  type: string = 'arc';

  getDefaultAttrs() {
    return {
      x: 0,
      y: 0,
      r: 0,
      startAngle: 0,
      endAngle: 0,
      clockwise: false,
      lineWidth: 1,
      startArrow: false,
      endArrow: false
    };
  }

  isPointInPath(x: number, y: number): boolean {
    const attrs = this.attrs;
    const cx = attrs.x;
    const cy = attrs.y;
    const { r, startAngle, endAngle, clockwise } = attrs;
    const lineWidth = this.getHitLineWidth();
    if (this.hasStroke()) {
      return Inside.arcline(cx, cy, r, startAngle, endAngle, clockwise, lineWidth, x, y);
    }
    return false;
  }

  calculateBox(): BBox {
    const attrs = this.attrs;
    const { x, y, r, startAngle, endAngle, clockwise } = attrs;
    const lineWidth = this.getHitLineWidth();
    const halfWidth = lineWidth / 2;
    const box = ArcMath.box(x, y, r, startAngle, endAngle, clockwise);
    return new BBox(box.x - halfWidth, box.y - halfWidth, box.width + lineWidth, box.height + lineWidth);
  }

  getStartTangent(): PointType[] {
    const attrs = this.attrs;
    const { x, y, startAngle, r, clockwise } = attrs;
    let diff = Math.PI / 180;
    if (clockwise) {
      diff *= -1;
    }
    const result = [];
    const x1 = _getArcX(x, r, startAngle + diff);
    const y1 = _getArcY(y, r, startAngle + diff);
    const x2 = _getArcX(x, r, startAngle);
    const y2 = _getArcY(y, r, startAngle);
    result.push([ x1, y1 ]);
    result.push([ x2, y2 ]);
    return result;
  }

  getEndTangent() {
    const attrs = this.attrs;
    const { x, y, endAngle, r, clockwise } = attrs;
    let diff = Math.PI / 180;
    const result = [];
    if (clockwise) {
      diff *= -1;
    }
    const x1 = _getArcX(x, r, endAngle + diff);
    const y1 = _getArcY(y, r, endAngle + diff);
    const x2 = _getArcX(x, r, endAngle);
    const y2 = _getArcY(y, r, endAngle);
    result.push([ x2, y2 ]);
    result.push([ x1, y1 ]);
    return result;
  }

  createPath(context: CanvasRenderingContext2D): void{
    const attrs = this.attrs;
    const { x, y, r, startAngle, endAngle, clockwise } = attrs;
    context = context || this.get('context');

    context.beginPath();
    context.arc(x, y, r, startAngle, endAngle, clockwise);
  }

  afterPath(context: CanvasRenderingContext2D): void{
    const attrs = this.attrs;
    context = context || this.get('context');

    if (attrs.startArrow) {
      const startPoints = this.getStartTangent();
      Arrow.addStartArrow(context, attrs, startPoints[0][0], startPoints[0][1], startPoints[1][0], startPoints[1][1]);
    }

    if (attrs.endArrow) {
      const endPoints = this.getEndTangent();
      Arrow.addEndArrow(context, attrs, endPoints[0][0], endPoints[0][1], endPoints[1][0], endPoints[1][1]);
    }
  }
}

export default Arc;
