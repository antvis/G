import { pointAtSegments, angleAtSegments, distanceAtSegment, lengthOfSegment } from './segments';
import polyline from './polyline';

function getAllPoints(points) {
  const tmp = points.slice(0);
  if (points.length) {
    tmp.push(points[0]);
  }
  return tmp;
}

export default {
  /**
   * 计算多边形的包围盒
   * @param {array} points 点的集合 [x,y] 的形式
   * @returns {object} 包围盒
   */
  box(points) {
    return polyline.box(points);
  },
  /**
   * 计算多边形的长度
   * @param {array} points 点的集合 [x,y] 的形式
   * @returns {object} 多边形边的长度
   */
  length(points) {
    return lengthOfSegment(getAllPoints(points));
  },
  /**
   * 根据比例获取多边形的点
   * @param {array} points 点的集合 [x,y] 的形式
   * @param {number} t 在多边形的长度上的比例
   * @returns {object} 根据比例值计算出来的点
   */
  pointAt(points, t) {
    return pointAtSegments(getAllPoints(points), t);
  },
  /**
   * 指定点到多边形的距离
   * @param {array} points 点的集合 [x,y] 的形式
   * @param {number} x 指定点的 x
   * @param {number} y 指定点的 y
   * @returns {number} 点到多边形的距离
   */
  pointDistance(points, x, y) {
    return distanceAtSegment(getAllPoints(points), x, y);
  },
  /**
   * 根据比例获取多边形的切线角度
   * @param {array} points 点的集合 [x,y] 的形式
   * @param {number} t 在多边形的长度上的比例
   * @returns {object} 根据比例值计算出来的角度
   */
  tangentAngle(points, t) {
    return angleAtSegments(getAllPoints(points), t);
  },
};
