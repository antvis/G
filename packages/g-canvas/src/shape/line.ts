/**
 * @fileoverview 圆
 * @author dxq613@gmail.com
 */

import ShapeBase from './base';

class Line extends ShapeBase {
  createPath(context) {
    const attrs = this.attr();
    const { x1, y1, x2, y2 } = attrs;
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
  }
}

export default Line;
