import type { PointLike as Point } from '@antv/g-lite';

/**
 * TODO: use clock from g later.
 */
export const clock =
  typeof performance === 'object' && performance.now ? performance : Date;

// 计算滑动的方向
export const calcDirection = (start: Point, end: Point) => {
  const xDistance = end.x - start.x;
  const yDistance = end.y - start.y;
  // x 的距离大于y 说明是横向，否则就是纵向
  if (Math.abs(xDistance) > Math.abs(yDistance)) {
    return xDistance > 0 ? 'right' : 'left';
  }
  return yDistance > 0 ? 'down' : 'up';
};

// 计算2点之间的距离
export const calcDistance = (point1: Point, point2: Point) => {
  const xDistance = Math.abs(point2.x - point1.x);
  const yDistance = Math.abs(point2.y - point1.y);
  return Math.sqrt(xDistance * xDistance + yDistance * yDistance);
};

export const getCenter = (point1: Point, point2: Point) => {
  const x = point1.x + (point2.x - point1.x) / 2;
  const y = point1.y + (point2.y - point1.y) / 2;
  return { x, y };
};
