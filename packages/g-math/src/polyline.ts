import { pointAtSegments, angleAtSegments, distanceAtSegment, lengthOfSegment } from './segments';

function getBBoxByArray(xArr, yArr) {
  const minX = Math.min.apply(null, xArr);
  const minY = Math.min.apply(null, yArr);
  const maxX = Math.max.apply(null, xArr);
  const maxY = Math.max.apply(null, yArr);
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

export default {
  /**
   * 计算多折线的包围盒
   * @param {array} points 点的集合 [x,y] 的形式
   * @returns {object} 包围盒
   */
  box(points: any[]) {
    const xArr = [];
    const yArr = [];
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      xArr.push(point[0]);
      yArr.push(point[1]);
    }
    return getBBoxByArray(xArr, yArr);
  },
  /**
   * 计算多折线的长度
   * @param {array} points 点的集合 [x,y] 的形式
   * @returns {object} 多条边的长度
   */
  length(points: any[]) {
    return lengthOfSegment(points);
  },
  /**
   * 根据比例获取多折线的点
   * @param {array} points 点的集合 [x,y] 的形式
   * @param {number} t 在多折线的长度上的比例
   * @returns {object} 根据比例值计算出来的点
   */
  pointAt(points: any[], t: number) {
    return pointAtSegments(points, t);
  },
  /**
   * 指定点到多折线的距离
   * @param {array} points 点的集合 [x,y] 的形式
   * @param {number} x 指定点的 x
   * @param {number} y 指定点的 y
   * @returns {number} 点到多折线的距离
   */
  pointDistance(points: any[], x: number, y: number) {
    return distanceAtSegment(points, x, y);
  },
  /**
   * 根据比例获取多折线的切线角度
   * @param {array} points 点的集合 [x,y] 的形式
   * @param {number} t 在多折线的长度上的比例
   * @returns {object} 根据比例值计算出来的角度
   */
  tangentAngle(points: any[], t: number) {
    return angleAtSegments(points, t);
  },
};
