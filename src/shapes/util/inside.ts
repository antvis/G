import * as Line from '../math/line';
import * as Quadratic from '../math/quadratic';
import * as Cubic from '../math/cubic';
import * as Arc from '../math/arc';
import { PointType } from '../../interface';

export function line(x1: number, y1: number, x2: number, y2: number, lineWidth: number, x: number, y: number): boolean {
  const boxRect = Line.box(x1, y1, x2, y2, lineWidth);

  if (!box(boxRect.minX, boxRect.maxX, boxRect.minY, boxRect.maxY, x, y)) {
    return false;
  }

  const d = Line.pointDistance(x1, y1, x2, y2, x, y);
  if (isNaN(d)) {
    return false;
  }
  return d <= lineWidth / 2;
}

export function polyline(points: PointType[], lineWidth: number, x: number, y: number): boolean {
  const l = points.length - 1;
  if (l < 1) {
    return false;
  }
  for (let i = 0; i < l; i++) {
    const x1 = points[i][0];
    const y1 = points[i][1];
    const x2 = points[i + 1][0];
    const y2 = points[i + 1][1];

    if (line(x1, y1, x2, y2, lineWidth, x, y)) {
      return true;
    }
  }

  return false;
}

export function cubicline(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  x4: number,
  y4: number,
  lineWidth: number,
  x: number,
  y: number
): boolean {
  return Cubic.pointDistance(x1, y1, x2, y2, x3, y3, x4, y4, x, y) <= lineWidth / 2;
}

export function quadraticline(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  lineWidth: number,
  x: number,
  y: number
): boolean {
  return Quadratic.pointDistance(x1, y1, x2, y2, x3, y3, x, y) <= lineWidth / 2;
}

export function arcline(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
  clockwise: boolean,
  lineWidth: number,
  x: number,
  y: number
): boolean {
  return (Arc.pointDistance(cx, cy, r, startAngle, endAngle, clockwise, x, y) as number) <= lineWidth / 2;
}

export function rect(rx: number, ry: number, width: number, height: number, x: number, y: number): boolean {
  return rx <= x && x <= rx + width && ry <= y && y <= ry + height;
}

export function circle(cx: number, cy: number, r: number, x: number, y: number): boolean {
  return Math.pow(x - cx, 2) + Math.pow(y - cy, 2) <= Math.pow(r, 2);
}

export function box(minX: number, maxX: number, minY: number, maxY: number, x: number, y: number): boolean {
  return minX <= x && x <= maxX && minY <= y && y <= maxY;
}
