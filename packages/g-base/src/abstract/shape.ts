import { IShape } from '../interfaces';
import { ShapeCfg } from '../types';
import BBox from '../bbox';
import Element from './element';
import { each, isArray } from '../util/util';
import { multiplyVec2 } from '../util/matrix';
abstract class AbstractShape extends Element implements IShape {
  constructor(cfg: ShapeCfg) {
    super(cfg);
  }

  // 是否在包围盒内
  _isInBBox(refX, refY): boolean {
    const bbox = this.getBBox();
    return bbox.minX <= refX && bbox.maxX >= refX && bbox.minY <= refY && bbox.maxY >= refY;
  }

  /**
   * 属性更改后需要做的事情
   * @protected
   */
  afterAttrsChange() {
    super.afterAttrsChange();
    this.clearCacheBBox();
  }
  // 计算包围盒时，需要缓存，这是一个高频的操作
  getBBox(): BBox {
    let bbox = this.get('bbox');
    if (!bbox) {
      bbox = this.calculateBBox();
      this.set('bbox', bbox);
    }
    return bbox;
  }
  // 计算相对于画布的包围盒
  getCanvasBBox(): BBox {
    let canvasBox = this.get('canvasBox');
    if (!canvasBox) {
      canvasBox = this.calculateCanvasBBox();
      this.set('canvasBox', canvasBox);
    }
    return canvasBox;
  }

  /**
   * 计算包围盒的抽象方法
   * @return {BBox} 包围盒
   */
  abstract calculateBBox(): BBox;

  applyMatrix(matrix: number[]) {
    super.applyMatrix(matrix);
    // 清理掉缓存的包围盒
    this.set('canvasBox', null);
  }

  /**
   * 计算相对于画布的包围盒，默认等同于 bbox
   * @return {BBox} 包围盒
   */
  calculateCanvasBBox(): BBox {
    const bbox = this.getBBox();
    const totalMatrix = this.getTotalMatrix();
    // 如果没有任何矩阵，则等同于计算 bbox
    if (!totalMatrix) {
      return bbox;
    }
    const topLeft = multiplyVec2(totalMatrix, [bbox.minX, bbox.minY]);
    const topRight = multiplyVec2(totalMatrix, [bbox.maxX, bbox.minY]);
    const bottomLeft = multiplyVec2(totalMatrix, [bbox.minX, bbox.maxY]);
    const bottomRight = multiplyVec2(totalMatrix, [bbox.maxX, bbox.maxY]);
    const minX = Math.min(topLeft[0], topRight[0], bottomLeft[0], bottomRight[0]);
    const maxX = Math.max(topLeft[0], topRight[0], bottomLeft[0], bottomRight[0]);
    const minY = Math.min(topLeft[1], topRight[1], bottomLeft[1], bottomRight[1]);
    const maxY = Math.max(topLeft[1], topRight[1], bottomLeft[1], bottomRight[1]);
    return BBox.fromRange(minX, minY, maxX, maxY);
  }

  /**
   * @protected
   * 清理缓存的 bbox
   */
  clearCacheBBox() {
    this.set('bbox', null);
    this.set('canvasBox', null);
  }

  // 实现接口
  isClipShape() {
    return this.get('isClipShape');
  }

  /**
   * @protected
   * 不同的图形自己实现是否在图形内部的逻辑，要判断边和填充区域
   * @param  {number}  refX 相对于图形的坐标 x
   * @param  {number}  refY 相对于图形的坐标 Y
   * @return {boolean} 点是否在图形内部
   */
  isInShape(refX: number, refY: number): boolean {
    return false;
  }

  /**
   * 是否仅仅使用 BBox 检测就可以判定拾取到图形
   * 默认是 false，但是有些图形例如 image、marker 等都可直接使用 BBox 的检测而不需要使用图形拾取
   * @return {Boolean} 仅仅使用 BBox 进行拾取
   */
  isOnlyHitBox() {
    return false;
  }

  // 不同的 Shape 各自实现
  isHit(x: number, y: number): boolean {
    const vec = [x, y, 1];
    this.invertFromMatrix(vec);
    const [refX, refY] = vec;
    const inBBox = this._isInBBox(refX, refY);
    // 跳过图形的拾取，在某些图形中可以省略一倍的检测成本
    if (this.isOnlyHitBox()) {
      return inBBox;
    }
    // 被裁减掉的和不在包围盒内的不进行计算
    if (inBBox && !this.isClipped(refX, refY)) {
      return this.isInShape(refX, refY);
    }
    return false;
  }
}

export default AbstractShape;
