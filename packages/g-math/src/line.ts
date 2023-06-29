import { vec2 } from 'gl-matrix';
import type { BBox, Point } from './types';
import { distance, getBBoxByArray } from './util';

export function box(x1: number, y1: number, x2: number, y2: number): BBox {
  return getBBoxByArray([x1, x2], [y1, y2]);
}

export function length(x1: number, y1: number, x2: number, y2: number) {
  return distance(x1, y1, x2, y2);
}

export function pointAt(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  t: number,
): Point {
  return {
    x: (1 - t) * x1 + t * x2,
    y: (1 - t) * y1 + t * y2,
  };
}

export function pointDistance(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x: number,
  y: number,
): number {
  // 投影距离 x1, y1 的向量，假设 p, p1, p2 三个点，投影点为 a
  // p1a = p1p.p1p2/|p1p2| * (p1p 的单位向量)
  const cross = (x2 - x1) * (x - x1) + (y2 - y1) * (y - y1);
  if (cross < 0) {
    return distance(x1, y1, x, y);
  }
  const lengthSquare = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
  if (cross > lengthSquare) {
    return distance(x2, y2, x, y);
  }
  return pointToLine(x1, y1, x2, y2, x, y);
}

export function pointToLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x: number,
  y: number,
) {
  const d: [number, number] = [x2 - x1, y2 - y1];
  // 如果端点相等，则判定点到点的距离
  if (vec2.exactEquals(d, [0, 0])) {
    return Math.sqrt((x - x1) * (x - x1) + (y - y1) * (y - y1));
  }
  const u: [number, number] = [-d[1], d[0]];
  vec2.normalize(u, u);
  const a: [number, number] = [x - x1, y - y1];
  return Math.abs(vec2.dot(a, u));
}

export function tangentAngle(x1: number, y1: number, x2: number, y2: number) {
  return Math.atan2(y2 - y1, x2 - x1);
}
