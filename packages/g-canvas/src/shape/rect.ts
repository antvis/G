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
      const [ r1, r2, r3, r4 ] = parseRadius(radius);
      context.moveTo(x + r1, y);
      context.lineTo(x + width - r2, y);
      r2 !== 0 && context.arc(x + width - r2, y + r2, r2, -Math.PI / 2, 0);
      context.lineTo(x + width, y + height - r3);
      r3 !== 0 && context.arc(x + width - r3, y + height - r3, r3, 0, Math.PI / 2);
      context.lineTo(x + r4, y + height);
      r4 !== 0 && context.arc(x + r4, y + height - r4, r4, Math.PI / 2, Math.PI);
      context.lineTo(x, y + r1);
      r1 !== 0 && context.arc(x + r1, y + r1, r1, Math.PI, Math.PI * 1.5);
      context.closePath();
    }
  }
}

export default Rect;
