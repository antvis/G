import { vec2 } from '@antv/util';
import BBox from '../../core/bbox';

export function at(p1: number, p2: number, t: number): number {
  return (p2 - p1) * t + p1;
}

export function pointDistance(x1: number, y1: number, x2: number, y2: number, x: number, y: number): number {
  const d = [x2 - x1, y2 - y1];
  if (vec2.exactEquals(d, [0, 0])) {
    return NaN;
  }

  const u = [-d[1], d[0]];
  vec2.normalize(u, u);
  const a = [x - x1, y - y1];
  return Math.abs(vec2.dot(a, u));
}

export function box(x1: number, y1: number, x2: number, y2: number, lineWidth: number): BBox {
  const halfWidth = lineWidth / 2;
  return BBox.fromRange(
    Math.min(x1, x2) - halfWidth,
    Math.min(y1, y2) - halfWidth,
    Math.max(x1, x2) + halfWidth,
    Math.max(y1, y2) + halfWidth
  );
}

export function len(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}
