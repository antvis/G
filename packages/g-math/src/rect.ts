import line from './line';
import { pointAtSegments, angleAtSegments } from './util';
function getPoints(x, y, width, height) {
  return [[x, y], [x + width, y], [x + width, y + height], [x, y + height], [x, y]];
}

export default {
  box(x: number, y: number, width: number, height: number) {
    return {
      x,
      y,
      width,
      height,
    };
  },
  length(width: number, height: number) {
    return (width + height) * 2;
  },
  pointDistance(x, y, width, height, x0, y0) {
    const points = getPoints(x, y, width, height);
    let minDistance = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const point = points[i];
      const nextPoint = points[i + 1];
      const distance = line.pointDistance(point[0], point[1], nextPoint[0], nextPoint[1], x0, y0);
      if (distance < minDistance) {
        minDistance = distance;
      }
    }
    return minDistance;
  },
  pointAt(x, y, width, height, t) {
    // 边界判断，避免获取顶点
    if (t > 1 || t < 0) {
      return null;
    }
    const points = getPoints(x, y, width, height);
    return pointAtSegments(points, t);
  },
  tangentAngle(x, y, width, height, t) {
    // 边界判断，避免获取顶点
    if (t > 1 || t < 0) {
      return 0;
    }
    const points = getPoints(x, y, width, height);
    return angleAtSegments(points, t);
  },
};
