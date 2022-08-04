import { PointLike } from '@antv/g';

export function isNearPoint(p: PointLike, q: PointLike, threshold: number) {
  return Math.abs(p.x - q.x) < threshold && Math.abs(p.y - q.y) < threshold;
}
