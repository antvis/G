import type { Point } from '../interface/annotation';
export function isNearPoint(p: Point, q: Point, threshold: number) {
  return Math.abs(p.x - q.x) < threshold && Math.abs(p.y - q.y) < threshold;
}
