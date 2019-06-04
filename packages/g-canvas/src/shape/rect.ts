/**
 * @fileoverview 矩形
 * @author dxq613@gmail.com
 */

import ShapeBase from './base';
import { parseRadius } from '../util/parse';

class Rect extends ShapeBase {

  getDefaultAttrs() {
    const attrs = super.getDefaultAttrs();
    // 设置默认值
    attrs['radius'] = 0;
    return attrs;
  }

  createPath(context) {
    const attrs = this.attr();
    const x = attrs.x;
    const y = attrs.y;
    const width = attrs.width;
    const height = attrs.height;
    const radius = attrs.radius;

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
