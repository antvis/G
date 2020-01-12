/**
 * @fileoverview 圆
 * @author dxq613@gmail.com
 */
import LineUtil from '@antv/g-math/lib/line';
import ShapeBase from './base';
import inLine from '../util/in-stroke/line';
import * as ArrowUtil from '../util/arrow';

class Line extends ShapeBase {
  getDefaultAttrs() {
    const attrs = super.getDefaultAttrs();
    return {
      ...attrs,
      startArrow: false,
      endArrow: false,
    };
  }

  getInnerBox(attrs) {
    const { x1, y1, x2, y2 } = this.attr();
    return LineUtil.box(x1, y1, x2, y2);
  }

  isInStrokeOrPath(x, y, isStroke, isFill, lineWidth) {
    if (!isStroke || !lineWidth) {
      return false;
    }
    const { x1, y1, x2, y2 } = this.attr();
    return inLine(x1, y1, x2, y2, lineWidth, x, y);
  }

  createPath(context) {
    const attrs = this.attr();
    const { x1, y1, x2, y2, startArrow, endArrow } = attrs;
    let startArrowDistance = {
      dx: 0,
      dy: 0,
    };
    let endArrowDistance = {
      dx: 0,
      dy: 0,
    };

    if (startArrow && startArrow.d) {
      startArrowDistance = ArrowUtil.getShortenOffset(x1, y1, x2, y2, attrs.startArrow.d);
    }
    if (endArrow && endArrow.d) {
      endArrowDistance = ArrowUtil.getShortenOffset(x1, y1, x2, y2, attrs.endArrow.d);
    }

    context.beginPath();
    // 如果自定义箭头，线条相应缩进
    context.moveTo(x1 + startArrowDistance.dx, y1 + startArrowDistance.dy);
    context.lineTo(x2 - endArrowDistance.dx, y2 - endArrowDistance.dy);
  }

  afterDrawPath(context) {
    const attrs = this.attr();
    const { x1, y1, x2, y2 } = attrs;
    if (attrs.startArrow) {
      ArrowUtil.addStartArrow(context, attrs, x2, y2, x1, y1);
    }
    if (attrs.endArrow) {
      ArrowUtil.addEndArrow(context, attrs, x1, y1, x2, y2);
    }
  }

  /**
   * Get length of line
   * @return {number} length
   */
  getTotalLength() {
    const { x1, y1, x2, y2 } = this.attr();
    return LineUtil.length(x1, y1, x2, y2);
  }

  /**
   * Get point according to ratio
   * @param {number} ratio
   * @return {Point} point
   */
  getPoint(ratio: number) {
    const { x1, y1, x2, y2 } = this.attr();
    return LineUtil.pointAt(x1, y1, x2, y2, ratio);
  }
}

export default Line;
