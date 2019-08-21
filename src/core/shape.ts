import * as Util from '@antv/util';
import Element from './element';
import * as Inside from '../shapes/util/inside';
import BBox from './bbox';

const ARRAY_ATTRS = {
  matrix: 'matrix',
  path: 'path',
  points: 'points',
  lineDash: 'lineDash',
};

function _cloneArrayAttr(arr: any[]) {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    if (Util.isArray(arr[i])) {
      result.push([].concat(arr[i]));
    } else {
      result.push(arr[i]);
    }
  }
  return result;
}

class Shape extends Element {
  isShape: boolean = true;
  id?: string;
  name?: string;

  createPath(context: CanvasRenderingContext2D) {}

  afterPath(context: CanvasRenderingContext2D) {}

  isPointInPath(x: number, y: number): boolean {
    return false;
  }

  drawInner(context: CanvasRenderingContext2D): void {
    const attrs = this.attrs;
    this.createPath(context);
    const originOpacity = context.globalAlpha;
    if (this.hasFill()) {
      const fillOpacity = attrs.fillOpacity;
      if (!Util.isNil(fillOpacity) && fillOpacity !== 1) {
        context.globalAlpha = fillOpacity;
        context.fill();
        context.globalAlpha = originOpacity;
      } else {
        context.fill();
      }
    }
    if (this.hasStroke()) {
      const lineWidth = this.attrs.lineWidth;
      if (lineWidth > 0) {
        const strokeOpacity = attrs.strokeOpacity;
        if (!Util.isNil(strokeOpacity) && strokeOpacity !== 1) {
          context.globalAlpha = strokeOpacity;
        }
        context.stroke();
      }
    }
    this.afterPath(context);
  }

  /**
   * 击中图形时是否进行包围盒判断
   * @return {Boolean} [description]
   */
  isHitBox(): boolean {
    return true;
  }

  /**
   * 节点是否能够被击中
   * @param {Number} x x坐标
   * @param {Number} y y坐标
   * @return {Boolean} 是否在图形中
   */
  isHit(x: number, y: number): boolean {
    const self = this;
    const v = [x, y, 1];
    self.invert(v); // canvas

    if (self.isHitBox()) {
      const box = self.getBBox();
      if (box && !Inside.box(box.minX, box.maxX, box.minY, box.maxY, v[0], v[1])) {
        return false;
      }
    }
    const clip = self.attrs.clip;
    if (clip) {
      clip.invert(v, self.get('canvas'));
      if (clip.isPointInPath(v[0], v[1])) {
        return self.isPointInPath(v[0], v[1]);
      }
    } else {
      return self.isPointInPath(v[0], v[1]);
    }
    return false;
  }

  /**
   * @protected
   * 计算包围盒
   * @return {Object} 包围盒
   */
  calculateBox(): BBox {
    return null;
  }

  // 获取拾取时线的宽度，需要考虑附加的线的宽度
  getHitLineWidth(): number {
    const attrs = this.attrs;
    // if (!attrs.stroke) {
    //   return 0;
    // }
    const lineAppendWidth = attrs.lineAppendWidth || 0;
    const lineWidth = attrs.lineWidth || 0;
    return lineWidth + lineAppendWidth;
  }

  // 清除当前的矩阵
  clearTotalMatrix(): void {
    this.cfg.totalMatrix = null;
    this.cfg.region = null;
  }

  clearBBox(): void {
    this.cfg.box = null;
    this.cfg.region = null;
  }

  getBBox(): BBox {
    let box = this.get('box');
    // 延迟计算
    if (!box) {
      box = this.calculateBox();
      if (box) {
        this.set('box', box);
      }
    }
    return box;
  }

  clone(): Shape {
    const self = this;
    let clone = null;
    const _attrs = self.attrs;
    const attrs = {};
    Util.each(_attrs, (i, k) => {
      if (ARRAY_ATTRS[k] && Util.isArray(_attrs[k])) {
        attrs[k] = _cloneArrayAttr(_attrs[k]);
      } else {
        attrs[k] = _attrs[k];
      }
    });
    clone = new Shape({
      attrs,
    });
    // zIndex也是绘图属性，但是在cfg中，特殊处理
    clone.cfg.zIndex = self.cfg.zIndex;
    return clone;
  }
}

export default Shape;
