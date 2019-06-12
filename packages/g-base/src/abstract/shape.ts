import { IShape } from '../interfaces';
import { ShapeCfg } from '../types';
import Element from './element';
import { each, isArray } from '@antv/util';

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
   * @protected
   * 不同的图形自己实现是否在图形内部的逻辑，要判断边和填充区域
   * @param  {number}  refX 相对于图形的坐标 x
   * @param  {number}  refY 相对于图形的坐标 Y
   * @return {boolean} 点是否在图形内部
   */
  isInShape(refX: number, refY: number): boolean {
    return false;
  }

  // 不同的 Shape 各自实现
  isHit(x: number, y: number): boolean {
    const vec = [x, y, 1];
    this.invertFromMatrix(vec);
    const [refX, refY] = vec;
    const inBBox = this._isInBBox(refX, refY);
    // 被裁减掉的和不在包围盒内的不进行计算
    if (inBBox && !this.isClipped(refX, refY)) {
      return this.isInShape(refX, refY);
    }
    return false;
  }
}

export default AbstractShape;
