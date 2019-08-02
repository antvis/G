/**
 * @fileoverview 圆
 * @author dxq613@gmail.com
 */

import ShapeBase from './base';
import inLine from '../util/in-stroke/line';
import LineUtil from '@antv/g-math/lib/line';

class Line extends ShapeBase {
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
    const { x1, y1, x2, y2 } = attrs;
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
  }
}

export default Line;
