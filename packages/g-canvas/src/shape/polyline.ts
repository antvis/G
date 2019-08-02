/**
 * @fileoverview 多边形
 * @author dxq613@gmail.com
 */

import ShapeBase from './base';
import inPolyline from '../util/in-stroke/polyline';
import PolylineUtil from '@antv/g-math/lib/polyline';

class PolyLine extends ShapeBase {
  // 不允许 fill
  isFill() {
    return false;
  }

  getInnerBox(attrs) {
    const { points } = attrs;
    return PolylineUtil.box(points);
  }

  isInStrokeOrPath(x, y, isStroke, isFill, lineWidth) {
    // 没有设置 stroke 不能被拾取, 没有线宽不能被拾取
    if (!isStroke || !lineWidth) {
      return false;
    }
    const { points } = this.attr();
    return inPolyline(points, lineWidth, x, y, false);
  }

  // 始终填充
  isStroke() {
    return true;
  }

  createPath(context) {
    const attrs = this.attr();
    const points = attrs.points;
    if (points.length < 2) {
      return;
    }
    context.beginPath();
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      if (i === 0) {
        context.moveTo(point[0], point[1]);
      } else {
        context.lineTo(point[0], point[1]);
      }
    }
  }
}

export default PolyLine;
