import type { PointLike } from '@antv/g';

export function isInvalidRect(p: PointLike, q: PointLike, threshold: number) {
  return Math.abs(p.x - q.x) < threshold || Math.abs(p.y - q.y) < threshold;
}

export function isNearPoint(p: PointLike, q: PointLike, threshold: number) {
  return Math.abs(p.x - q.x) < threshold && Math.abs(p.y - q.y) < threshold;
}

/**
 * {\displaystyle \operatorname {distance} (P,\theta ,(x_{0},y_{0}))=|\cos(\theta )(P_{y}-y_{0})-\sin(\theta )(P_{x}-x_{0})|}
 */
export function distanceFromPointToLine(p: PointLike, rad: number, t: PointLike) {
  // return Math.abs(Math.cos(rad) * (p.y - t.y) - Math.sin(rad) * (p.x - t.x));
  return Math.cos(rad) * (p.y - t.y) - Math.sin(rad) * (p.x - t.x);
}
