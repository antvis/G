/**
 * @fileoverview 椭圆
 * @author dxq613@gmail.com
 */

import ShapeBase from './base';

class Ellipse extends ShapeBase {

  createPath(context) {
    const attrs = this.attr();
    const cx = attrs.x;
    const cy = attrs.y;
    const rx = attrs.rx;
    const ry = attrs.ry;
    context.beginPath();
    // 兼容逻辑
    if (context.ellipse) {
      context.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2, false);
    } else {
      // 如果不支持，则使用圆来绘制，进行变形
      const r = (rx > ry) ? rx : ry;
      const scaleX = (rx > ry) ? 1 : rx / ry;
      const scaleY = (rx > ry) ? ry / rx : 1;
      context.save();
      context.translate(cx, cy);
      context.scale(scaleX, scaleY);
      context.arc(0, 0, r, 0, Math.PI * 2);
      context.restore();
      context.closePath();
    }
  }
}

export default Ellipse;