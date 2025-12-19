import { distance, linePointToLine } from '@antv/g-math';

export function inBox(
  minX: number,
  minY: number,
  width: number,
  height: number,
  x: number,
  y: number,
) {
  return x >= minX && x <= minX + width && y >= minY && y <= minY + height;
}

export function inRect(
  minX: number,
  minY: number,
  width: number,
  height: number,
  lineWidth: number,
  x: number,
  y: number,
) {
  const halfWidth = lineWidth / 2;
  // 将四个边看做矩形来检测，比边的检测算法要快
  return (
    inBox(minX - halfWidth, minY - halfWidth, width, lineWidth, x, y) || // 上边
    inBox(
      minX + width - halfWidth,
      minY - halfWidth,
      lineWidth,
      height,
      x,
      y,
    ) || // 右边
    inBox(
      minX + halfWidth,
      minY + height - halfWidth,
      width,
      lineWidth,
      x,
      y,
    ) || // 下边
    inBox(minX - halfWidth, minY + halfWidth, lineWidth, height, x, y)
  ); // 左边
}

export function inArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
  lineWidth: number,
  x: number,
  y: number,
) {
  const angle = (Math.atan2(y - cy, x - cx) + Math.PI * 2) % (Math.PI * 2); // 转换到 0 - 2 * Math.PI 之间
  // if (angle < startAngle || angle > endAngle) {
  //   return false;
  // }
  const point = {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  };

  return distance(point.x, point.y, x, y) <= lineWidth / 2;
}

export function inLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  lineWidth: number,
  x: number,
  y: number,
) {
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);
  const halfWidth = lineWidth / 2;
  // 因为目前的方案是计算点到直线的距离，而有可能会在延长线上，所以要先判断是否在包围盒内
  // 这种方案会在水平或者竖直的情况下载线的延长线上有半 lineWidth 的误差
  if (
    !(
      x >= minX - halfWidth &&
      x <= maxX + halfWidth &&
      y >= minY - halfWidth &&
      y <= maxY + halfWidth
    )
  ) {
    return false;
  }
  // 因为已经计算了包围盒，所以仅需要计算到直线的距离即可，可以显著提升性能
  return linePointToLine(x1, y1, x2, y2, x, y) <= lineWidth / 2;
}

export function inPolyline(
  points: any[],
  lineWidth: number,
  x: number,
  y: number,
  isClose: boolean,
) {
  const count = points.length;
  if (count < 2) {
    return false;
  }
  for (let i = 0; i < count - 1; i++) {
    const x1 = points[i][0];
    const y1 = points[i][1];
    const x2 = points[i + 1][0];
    const y2 = points[i + 1][1];

    if (inLine(x1, y1, x2, y2, lineWidth, x, y)) {
      return true;
    }
  }

  // 如果封闭，则计算起始点和结束点的边
  if (isClose) {
    const first = points[0];
    const last = points[count - 1];
    if (inLine(first[0], first[1], last[0], last[1], lineWidth, x, y)) {
      return true;
    }
  }

  return false;
}

// 多边形的射线检测，参考：https://blog.csdn.net/WilliamSun0122/article/details/77994526
const tolerance = 1e-6;
// 三态函数，判断两个double在eps精度下的大小关系
function dcmp(x: number) {
  if (Math.abs(x) < tolerance) {
    return 0;
  }

  return x < 0 ? -1 : 1;
}

// 判断点Q是否在p1和p2的线段上
function onSegment(p1: any, p2: any, q: any) {
  if (
    (q[0] - p1[0]) * (p2[1] - p1[1]) === (p2[0] - p1[0]) * (q[1] - p1[1]) &&
    Math.min(p1[0], p2[0]) <= q[0] &&
    q[0] <= Math.max(p1[0], p2[0]) &&
    Math.min(p1[1], p2[1]) <= q[1] &&
    q[1] <= Math.max(p1[1], p2[1])
  ) {
    return true;
  }
  return false;
}

// 判断点P在多边形内-射线法
export function inPolygon(points: any[], x: number, y: number) {
  let isHit = false;
  const n = points.length;
  if (n <= 2) {
    // svg 中点小于 3 个时，不显示，也无法被拾取
    return false;
  }
  for (let i = 0; i < n; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    if (onSegment(p1, p2, [x, y])) {
      // 点在多边形一条边上
      return true;
    }
    // 前一个判断min(p1[1],p2[1])<P.y<=max(p1[1],p2[1])
    // 后一个判断被测点 在 射线与边交点 的左边
    if (
      dcmp(p1[1] - y) > 0 !== dcmp(p2[1] - y) > 0 &&
      dcmp(x - ((y - p1[1]) * (p1[0] - p2[0])) / (p1[1] - p2[1]) - p1[0]) < 0
    ) {
      isHit = !isHit;
    }
  }
  return isHit;
}
export function inPolygons(polygons: any[], x: number, y: number): boolean {
  let isHit = false;
  for (let i = 0; i < polygons.length; i++) {
    const points = polygons[i];
    isHit = inPolygon(points, x, y);
    if (isHit) {
      break;
    }
  }
  return isHit;
}
