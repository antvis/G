/**
 * @fileoverview 圆
 * @author dxq613@gmail.com
 */

import ShapeBase from './base';

class Circle extends ShapeBase {

  createPath(context) {
    const attrs = this.attr();
    const cx = attrs.x;
    const cy = attrs.y;
    const r = attrs.r;
    context.beginPath();
    context.arc(cx, cy, r, 0, Math.PI * 2, false);
    context.closePath();
  }
}

export default Circle;
