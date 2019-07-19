import { distance } from './util';

export default {
  /**
   * 计算包围盒
   * @param {number} x 圆心 x
   * @param {number} y 圆心 y
   * @param {number} r 半径
   * @returns {object} 包围盒
   */
  box(x: number, y: number, r: number) {
    return {
      x: x - r,
      y: x - r,
      width: 2 * r,
      height: 2 * r,
    };
  },
  /**
   * 计算周长
   * @param {number} x 圆心 x
   * @param {number} y 圆心 y
   * @param {number} r 半径
   * @returns {number} 周长
   */
  length(x: number, y: number, r: number) {
    return Math.PI * 2 * r;
  },
  /**
   * 根据比例获取点
   * @param {number} x 圆心 x
   * @param {number} y 圆心 y
   * @param {number} r 半径
   * @param {number} t 指定比例，x轴方向为 0
   * @returns {object} 点
   */
  pointAt(x: number, y: number, r: number, t: number) {
    const angle = Math.PI * 2 * t;
    return {
      x: x + r * Math.cos(angle),
      y: y + r * Math.sin(angle),
    };
  },
  /**
   * 点到圆的距离
   * @param {number} x 圆心 x
   * @param {number} y 圆心 y
   * @param {number} r 半径
   * @param {number} x0  指定的点 x
   * @param {number} y0  指定的点 y
   * @returns {number} 距离
   */
  pointDistance(x: number, y: number, r: number, x0, y0) {
    return Math.abs(distance(x, y, x0, y0) - r);
  },
  /**
   * 根据比例计算切线角度
   * @param {number} x 圆心 x
   * @param {number} y 圆心 y
   * @param {number} r 半径
   * @param {number} t 指定比例 0 - 1 之间，x轴方向为 0。在 0-1 范围之外是循环还是返回 null，还需要调整
   * @returns {number} 角度，在 0 - 2PI 之间
   */
  tangentAngle(x: number, y: number, r: number, t) {
    const angle = Math.PI * 2 * t;
    return (angle + Math.PI / 2) % (Math.PI * 2);
  },
};
