import * as Util from '@antv/util';
import Shape from '../core/shape';
import * as Arrow from './util/arrow';
import * as LineMath from './math/line';
import * as Inside from './util/inside';
import BBox from '../core/bbox';
import { PointType } from '../interface';

class Line extends Shape {
  canStroke: boolean = true;
  type: string = 'line';

  getDefaultAttrs() {
    return {
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 0,
      lineWidth: 1,
      startArrow: false,
      endArrow: false
    };
  }

  isPointInPath(x: number, y: number): boolean {
    const attrs = this.attrs;
    const { x1, y1, x2, y2 } = attrs;
    const lineWidth = this.getHitLineWidth();

    if (this.hasStroke()) {
      return Inside.line(x1, y1, x2, y2, lineWidth, x, y);
    }
    return false;
  }

  calculateBox(): BBox {
    const attrs = this.attrs;
    const { x1, y1, x2, y2 } = attrs;
    const lineWidth = this.getHitLineWidth();
    return LineMath.box(x1, y1, x2, y2, lineWidth);
  }

  createPath(context: CanvasRenderingContext2D): void {
    const self = this;
    const attrs = self.attrs;
    const { x1, y1, x2, y2 } = attrs;
    context = context || self.get('context');
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
  }

  afterPath(context: CanvasRenderingContext2D): void {
    const attrs = this.attrs;
    const { x1, y1, x2, y2 } = attrs;
    context = context || this.get('context');
    if (attrs.startArrow) {
      Arrow.addStartArrow(context, attrs, x2, y2, x1, y1);
    }
    if (attrs.endArrow) {
      Arrow.addEndArrow(context, attrs, x1, y1, x2, y2);
    }
  }

  getPoint(t: number): PointType {
    const attrs = this.attrs;
    return {
      x: LineMath.at(attrs.x1, attrs.x2, t),
      y: LineMath.at(attrs.y1, attrs.y2, t)
    };
  }
}

export default Line;
