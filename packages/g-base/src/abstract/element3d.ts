import { clone } from '@antv/util';
import * as mat4 from '@antv/gl-matrix/lib/gl-matrix/mat4';
import { IElement3D } from '../interfaces';
import Element from './element';

// 三维单位矩阵
const THREE_DIM_IDENTITY_MATRIX = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

abstract class Element3D extends Element implements IElement3D {
  /**
   * 移动元素
   * @param {number} translateX x 轴方向的移动距离
   * @param {number} translateY y 轴方向的移动距离
   * @param {number} translateZ z 轴方向的移动距离
   * @return {IElement} 元素
   */
  translate(translateX: number = 0, translateY: number = 0, translateZ: number = 0) {
    const matrix = this.attr('matrix') || clone(THREE_DIM_IDENTITY_MATRIX);
    mat4.translate(matrix, matrix, [translateX, translateY, translateZ]);
    this.clearTotalMatrix();
    this.attr('matrix', matrix);
    return this;
  }

  /**
   * 移动元素到目标位置
   * @param {number} targetX 目标位置的 x 轴坐标
   * @param {number} targetY 目标位置的 y 轴坐标
   * @param {number} targetZ 目标位置的 z 轴坐标
   * @return {IElement} 元素
   */
  move(targetX: number, targetY: number, targetZ: number) {
    const x = this.attr('x') || 0;
    const y = this.attr('y') || 0;
    const z = this.attr('z') || 0;
    this.translate(targetX - x, targetY - y, targetZ - z);
    return this;
  }

  /**
   * 缩放元素
   * @param {number} ratioX x 轴方向的缩放比例
   * @param {number} ratioY y 轴方向的缩放比例
   * @param {number} ratioZ z 轴方向的缩放比例
   * @return {IElement} 元素
   */
  scale(ratioX: number, ratioY?: number, ratioZ?: number) {
    const matrix = this.attr('matrix') || clone(THREE_DIM_IDENTITY_MATRIX);
    // 先设置 ratioZ，再设置 ratioY
    ratioZ = ratioZ || (ratioY ? 1 : ratioX);
    ratioY = ratioY || ratioX;
    mat4.scale(matrix, matrix, [ratioX, ratioY, ratioZ]);
    this.clearTotalMatrix();
    this.attr('matrix', matrix);
    return this;
  }

  /**
   * 旋转元素
   * @param {number} radian 旋转角度
   * @param {number[]} vec 三维坐标向量
   * @return {IElement} 元素
   */
  rotate(radian: number, vec: number[]) {
    const matrix = this.attr('matrix') || clone(THREE_DIM_IDENTITY_MATRIX);
    mat4.rotate(matrix, matrix, radian, vec);
    this.clearTotalMatrix();
    this.attr('matrix', matrix);
    return this;
  }
}

export default Element3D;
