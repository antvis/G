import type { PointLike } from '@antv/g';

export function isInvalidRect(p: PointLike, q: PointLike, threshold: number) {
  return Math.abs(p.x - q.x) < threshold || Math.abs(p.y - q.y) < threshold;
}
