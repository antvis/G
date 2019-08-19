import * as Util from '@antv/util';
import BBox from '../../core/bbox';
import { PointType } from '../../interface';

/**
 * 计算在圆弧上的角度对应的点
 * @param cx
 * @param cy
 * @param r
 * @param angle
 */
const circlePoint = (cx: number, cy: number, r: number, angle: number): PointType => {
  return {
    x: Math.cos(angle) * r + cx,
    y: Math.sin(angle) * r + cy
  };
};

const angleNearTo = (angle: number, min: number, max: number, out: boolean): number => {
  let v1;
  let v2;
  if (out) {
    if (angle < min) {
      v1 = min - angle;
      v2 = Math.PI * 2 - max + angle;
    } else if (angle > max) {
      v1 = Math.PI * 2 - angle + min;
      v2 = angle - max;
    }
  } else {
    v1 = angle - min;
    v2 = max - angle;
  }

  return v1 > v2 ? max : min;
};

export const nearAngle = (angle: number, startAngle: number, endAngle: number, clockwise: boolean): number => {
  let plus = 0;
  if (endAngle - startAngle >= Math.PI * 2) {
    plus = Math.PI * 2;
  }
  startAngle = Util.mod(startAngle, Math.PI * 2);
  endAngle = Util.mod(endAngle, Math.PI * 2) + plus;
  angle = Util.mod(angle, Math.PI * 2);
  if (clockwise) {
    if (startAngle >= endAngle) {
      if (angle > endAngle && angle < startAngle) {
        return angle;
      }
      return angleNearTo(angle, endAngle, startAngle, true);
    }
    if (angle < startAngle || angle > endAngle) {
      return angle;
    }
    return angleNearTo(angle, startAngle, endAngle, false);
  }
  if (startAngle <= endAngle) {
    if (startAngle < angle && angle < endAngle) {
      return angle;
    }
    return angleNearTo(angle, startAngle, endAngle, true);
  }
  if (angle > startAngle || angle < endAngle) {
    return angle;
  }
  return angleNearTo(angle, endAngle, startAngle, false);
};

export const pointDistance = (
  cx: number, cy: number, r: number,
  startAngle: number, endAngle: number, clockwise: boolean,
  x: number, y: number,
  out?: boolean
): number | PointType => {
  const v = [ x, y ];
  const v0 = [ cx, cy ];
  const v1 = [ 1, 0 ];
  const subv = Util.vec2.subtract([], v, v0);
  let angle = Util.vec2.angleTo(v1, subv);

  angle = nearAngle(angle, startAngle, endAngle, clockwise);
  const vpoint = [ r * Math.cos(angle) + cx, r * Math.sin(angle) + cy ];
  if (out) {
    return {
      x: vpoint[0],
      y: vpoint[1],
    };
  }
  return Util.vec2.distance(vpoint, v);
};

export const box = (
  cx: number, cy: number, r: number,
  startAngle: number, endAngle: number, clockwise: boolean
): BBox => {
  const angleRight = 0;
  const angleBottom = Math.PI / 2;
  const angleLeft = Math.PI;
  const angleTop = Math.PI * 3 / 2;
  const points = [];


  let angle = nearAngle(angleRight, startAngle, endAngle, clockwise);
  if (angle === angleRight) {
    points.push(circlePoint(cx, cy, r, angleRight));
  }

  angle = nearAngle(angleBottom, startAngle, endAngle, clockwise);
  if (angle === angleBottom) {
    points.push(circlePoint(cx, cy, r, angleBottom));
  }

  angle = nearAngle(angleLeft, startAngle, endAngle, clockwise);
  if (angle === angleLeft) {
    points.push(circlePoint(cx, cy, r, angleLeft));
  }

  angle = nearAngle(angleTop, startAngle, endAngle, clockwise);
  if (angle === angleTop) {
    points.push(circlePoint(cx, cy, r, angleTop));
  }

  points.push(circlePoint(cx, cy, r, startAngle));
  points.push(circlePoint(cx, cy, r, endAngle));

  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);

  return BBox.fromRange(Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys));
};

export const projectPoint = (
  cx: number, cy: number,r: number,
  startAngle: number, endAngle: number,
  clockwise: boolean, x: number, y: number
): PointType => {
  return pointDistance(cx, cy, r, startAngle, endAngle, clockwise, x, y, true) as PointType;
};
