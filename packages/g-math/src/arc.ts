import { distance, piMod } from './util';
import ellipse from './ellipse';
import * as mat3 from '@antv/gl-matrix/lib/gl-matrix/mat3';

// 偏导数 x
function derivativeXAt(cx, cy, rx, ry, xRotation, startAngle, endAngle, angle) {
  return -1 * rx * Math.cos(xRotation) * Math.sin(angle) - ry * Math.sin(xRotation) * Math.cos(angle);
}

// 偏导数 y
function derivativeYAt(cx, cy, rx, ry, xRotation, startAngle, endAngle, angle) {
  return -1 * rx * Math.sin(xRotation) * Math.sin(angle) + ry * Math.cos(xRotation) * Math.cos(angle);
}

// x 的极值
function xExtrema(rx, ry, xRotation) {
  return Math.atan((-ry / rx) * Math.tan(xRotation));
}
// y 的极值
function yExtrema(rx, ry, xRotation) {
  return Math.atan(ry / (rx * Math.tan(xRotation)));
}

// 根据角度求 x 坐标
function xAt(cx, cy, rx, ry, xRotation, angle) {
  return rx * Math.cos(xRotation) * Math.cos(angle) - ry * Math.sin(xRotation) * Math.sin(angle) + cx;
}

// 根据角度求 y 坐标
function yAt(cx, cy, rx, ry, xRotation, angle) {
  return rx * Math.sin(xRotation) * Math.cos(angle) + ry * Math.cos(xRotation) * Math.sin(angle) + cy;
}

// 获取点在椭圆上的角度
function getAngle(rx, ry, x0, y0) {
  const angle = Math.atan2(y0 * rx, x0 * ry);
  // 转换到 0 - 2PI 内
  return (angle + Math.PI * 2) % (Math.PI * 2);
}

// 根据角度获取，x,y
function getPoint(rx, ry, angle) {
  return {
    x: rx * Math.cos(angle),
    y: ry * Math.sin(angle),
  };
}

// 旋转
function rotate(x, y, angle) {
  return [x * Math.cos(angle) - y * Math.sin(angle), x * Math.sin(angle) + y * Math.cos(angle)];
}

export default {
  /**
   * 计算包围盒
   * @param {number} cx         圆心 x
   * @param {number} cy         圆心 y
   * @param {number} rx         x 轴方向的半径
   * @param {number} ry         y 轴方向的半径
   * @param {number} xRotation  旋转角度
   * @param {number} startAngle 起始角度
   * @param {number} endAngle   结束角度
   * @returns {object} 包围盒对象
   */
  box(cx, cy, rx, ry, xRotation, startAngle, endAngle) {
    const xDim = xExtrema(rx, ry, xRotation);
    let minX = Infinity;
    let maxX = -Infinity;
    const xs = [startAngle, endAngle];
    for (let i = -Math.PI * 2; i <= Math.PI * 2; i += Math.PI) {
      const xAngle = xDim + i;
      if (startAngle < xAngle && xAngle < endAngle) {
        xs.push(xAngle);
      }
    }

    for (let i = 0; i < xs.length; i++) {
      const x = xAt(cx, cy, rx, ry, xRotation, xs[i]);
      if (x < minX) {
        minX = x;
      }
      if (x > maxX) {
        maxX = x;
      }
    }

    const yDim = yExtrema(rx, ry, xRotation);
    let minY = Infinity;
    let maxY = -Infinity;
    const ys = [startAngle, endAngle];
    for (let i = -Math.PI * 2; i <= Math.PI * 2; i += Math.PI) {
      const yAngle = yDim + i;
      if (startAngle < yAngle && yAngle < endAngle) {
        ys.push(yAngle);
      }
    }

    for (let i = 0; i < ys.length; i++) {
      const y = yAt(cx, cy, rx, ry, xRotation, ys[i]);
      if (y < minY) {
        minY = y;
      }
      if (y > maxY) {
        maxY = y;
      }
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  },
  /**
   * 获取圆弧的长度，计算圆弧长度时不考虑旋转角度，
   * 仅跟 rx, ry, startAngle, endAngle 相关
   * @param {number} cx         圆心 x
   * @param {number} cy         圆心 y
   * @param {number} rx         x 轴方向的半径
   * @param {number} ry         y 轴方向的半径
   * @param {number} xRotation  旋转角度
   * @param {number} startAngle 起始角度
   * @param {number} endAngle   结束角度
   */
  length(cx, cy, rx, ry, xRotation, startAngle, endAngle) {},
  /**
   * 获取指定点到圆弧的最近距离的点
   * @param {number} cx         圆心 x
   * @param {number} cy         圆心 y
   * @param {number} rx         x 轴方向的半径
   * @param {number} ry         y 轴方向的半径
   * @param {number} xRotation  旋转角度
   * @param {number} startAngle 起始角度
   * @param {number} endAngle   结束角度
   * @returns {object} 到指定点最近距离的点
   */
  nearestPoint(cx, cy, rx, ry, xRotation, startAngle, endAngle, x0, y0) {
    // 将最近距离问题转换成到椭圆中心 0,0 没有旋转的椭圆问题
    const relativeVector = rotate(x0 - cx, y0 - cy, -xRotation);
    const [x1, y1] = relativeVector;
    // 计算点到椭圆的最近的点
    let relativePoint = ellipse.nearestPoint(0, 0, rx, ry, x1, y1);
    // 获取点在椭圆上的角度
    const angle = getAngle(rx, ry, relativePoint.x, relativePoint.y);
    // 点没有在圆弧上
    if (angle < startAngle) {
      // 小于起始圆弧
      relativePoint = getPoint(rx, ry, startAngle);
    } else if (angle > endAngle) {
      // 大于结束圆弧
      relativePoint = getPoint(rx, ry, endAngle);
    }
    // 旋转到 xRotation 的角度
    const vector = rotate(relativePoint.x, relativePoint.y, xRotation);
    return {
      x: vector[0] + cx,
      y: vector[1] + cy,
    };
  },
  pointDistance(cx, cy, rx, ry, xRotation, startAngle, endAngle, x0, y0) {
    const nearestPoint = this.nearestPoint(cx, cy, rx, ry, x0, y0);
    return distance(nearestPoint.x, nearestPoint.y, x0, y0);
  },
  pointAt(cx, cy, rx, ry, xRotation, startAngle, endAngle, t) {
    const angle = (endAngle - startAngle) * t + startAngle;
    return {
      x: xAt(cx, cy, rx, ry, xRotation, angle),
      y: yAt(cx, cy, rx, ry, xRotation, angle),
    };
  },
  tangentAngle(cx, cy, rx, ry, xRotation, startAngle, endAngle, t) {
    const angle = (endAngle - startAngle) * t + startAngle;
    const dx = derivativeXAt(cx, cy, rx, ry, xRotation, startAngle, endAngle, angle);
    const dy = derivativeYAt(cx, cy, rx, ry, xRotation, startAngle, endAngle, angle);
    return piMod(Math.atan2(dy, dx));
  },
};
