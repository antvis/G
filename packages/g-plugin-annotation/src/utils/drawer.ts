import { PointLike } from '@antv/g-lite';

export function isInvalidRect(p: PointLike, q: PointLike, threshold: number) {
  return Math.abs(p.x - q.x) < threshold || Math.abs(p.y - q.y) < threshold;
}

export function isNearPoint(p: PointLike, q: PointLike, threshold: number) {
  return Math.abs(p.x - q.x) < threshold && Math.abs(p.y - q.y) < threshold;
}

/**
 * {\displaystyle \operatorname {distance} (P,\theta ,(x_{0},y_{0}))=|\cos(\theta )(P_{y}-y_{0})-\sin(\theta )(P_{x}-x_{0})|}
 */
export function distanceFromPointToLine(
  p: PointLike,
  rad: number,
  t: PointLike,
) {
  // return Math.abs(Math.cos(rad) * (p.y - t.y) - Math.sin(rad) * (p.x - t.x));
  return Math.cos(rad) * (p.y - t.y) - Math.sin(rad) * (p.x - t.x);
}

export function getABC(p1: PointLike, p2: PointLike) {
  return {
    A: p2.y - p1.y,
    B: p1.x - p2.x,
    C: p2.x * p1.y - p1.x * p2.y,
  };
}

export function getFootOfPerpendicular(
  p: PointLike,
  A: number,
  B: number,
  C: number,
) {
  if (A * A + B * B < 1e-13) return null;

  if (Math.abs(A * p.x + B * p.y + C) < 1e-13) {
    return { x: p.x, y: p.y };
  }
  const newX = (B * B * p.x - A * B * p.y - A * C) / (A * A + B * B);
  const newY = (-A * B * p.x + A * A * p.y - B * C) / (A * A + B * B);
  return { x: newX, y: newY };
}

export function lineIntersect(
  p1: PointLike,
  p2: PointLike,
  p3: PointLike,
  p4: PointLike,
) {
  const denom = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
  if (denom === 0) {
    return null;
  }
  const ua =
    ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denom;
  const ub =
    ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / denom;
  return {
    x: p1.x + ua * (p2.x - p1.x),
    y: p1.y + ua * (p2.y - p1.y),
    seg1: ua >= 0 && ua <= 1,
    seg2: ub >= 0 && ub <= 1,
  };
}
