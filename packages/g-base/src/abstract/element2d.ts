import { clone } from '@antv/util';
import * as mat3 from '@antv/gl-matrix/lib/gl-matrix/mat3';
import { IElement2D } from '../interfaces';
import Element from './element';

// 二维单位矩阵
const TWO_DIM_IDENTITY_MATRIX = [1, 0, 0, 0, 1, 0, 0, 0, 1];

abstract class Element2D extends Element implements IElement2D {
  /**
   * 移动元素
   * @param {number} translateX 水平移动距离
   * @param {number} translateY 垂直移动距离
   * @return {IElement} 元素
   */
  translate(translateX: number = 0, translateY: number = 0) {
    // 注意: 这里 TWO_DIM_IDENTITY_MATRIX 不能直接赋值给 matrix，需要使用 cloen 包裹一层
    // 因为调用 mat3 方法会修改 matrix 引用的值
    const matrix = this.attr('matrix') || clone(TWO_DIM_IDENTITY_MATRIX);
    mat3.translate(matrix, matrix, [translateX, translateY]);
    this.clearTotalMatrix();
    this.attr('matrix', matrix);
    return this;
  }

  /**
   * 移动元素到目标位置
   * @param {number} targetX 目标位置的水平坐标
   * @param {number} targetX 目标位置的垂直坐标
   * @return {IElement} 元素
   */
  move(targetX: number, targetY: number) {
    const x = this.attr('x') || 0;
    const y = this.attr('y') || 0;
    this.translate(targetX - x, targetY - y);
    return this;
  }

  /**
   * 缩放元素
   * @param {number} ratioX 水平缩放比例
   * @param {number} ratioY 垂直缩放比例
   * @return {IElement} 元素
   */
  scale(ratioX: number, ratioY?: number) {
    const matrix = this.attr('matrix') || clone(TWO_DIM_IDENTITY_MATRIX);
    mat3.scale(matrix, matrix, [ratioX, ratioY || ratioX]);
    this.clearTotalMatrix();
    this.attr('matrix', matrix);
    return this;
  }

  /**
   * 旋转元素
   * @param {number} radian 旋转角度
   * @return {IElement} 元素
   */
  rotate(radian: number) {
    const matrix = this.attr('matrix') || clone(TWO_DIM_IDENTITY_MATRIX);
    mat3.rotate(matrix, matrix, radian);
    this.clearTotalMatrix();
    this.attr('matrix', matrix);
    return this;
  }
}

export default Element2D;
