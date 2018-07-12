const Util = require('../util/index');
const isPointInPath = require('./mixin/isPointInPath');
const Element = require('./element');
const Inside = require('../shapes/util/inside');

const Shape = function(cfg) {
  Shape.superclass.constructor.call(this, cfg);
};

Shape.ATTRS = {};

Util.extend(Shape, Element);

Util.augment(Shape, isPointInPath, {
  isShape: true,
  drawInner(context) {
    const self = this;
    const attrs = self._attrs;
    self.createPath(context);
    const originOpacity = context.globalAlpha;
    if (self.hasFill()) {
      const fillOpacity = attrs.fillOpacity;
      if (!Util.isNil(fillOpacity) && fillOpacity !== 1) {
        context.globalAlpha = fillOpacity;
        context.fill();
        context.globalAlpha = originOpacity;
      } else {
        context.fill();
      }
    }
    if (self.hasStroke()) {
      const lineWidth = self._attrs.lineWidth;
      if (lineWidth > 0) {
        const strokeOpacity = attrs.strokeOpacity;
        if (!Util.isNil(strokeOpacity) && strokeOpacity !== 1) {
          context.globalAlpha = strokeOpacity;
        }
        context.stroke();
      }
    }
    self.afterPath(context);
  },
  afterPath() {},
  /**
   * 击中图形时是否进行包围盒判断
   * @return {Boolean} [description]
   */
  isHitBox() {
    return true;
  },
  /**
   * 节点是否能够被击中
   * @param {Number} x x坐标
   * @param {Number} y y坐标
   * @return {Boolean} 是否在图形中
   */
  isHit(x, y) {
    const self = this;
    const v = [ x, y, 1 ];
    self.invert(v); // canvas

    if (self.isHitBox()) {
      const box = self.getBBox();
      if (box && !Inside.box(box.minX, box.maxX, box.minY, box.maxY, v[0], v[1])) {
        return false;
      }
    }
    const clip = self._attrs.clip;
    if (clip) {
      clip.invert(v, self.get('canvas'));
      if (clip.isPointInPath(v[0], v[1])) {
        return self.isPointInPath(v[0], v[1]);
      }
    } else {
      return self.isPointInPath(v[0], v[1]);
    }
    return false;
  },
  /**
   * @protected
   * 计算包围盒
   * @return {Object} 包围盒
   */
  calculateBox() {
    return null;
  },
  // 获取拾取时线的宽度，需要考虑附加的线的宽度
  getHitLineWidth() {
    const attrs = this._attrs;
    // if (!attrs.stroke) {
    //   return 0;
    // }
    const lineAppendWidth = attrs.lineAppendWidth || 0;
    const lineWidth = attrs.lineWidth || 0;
    return lineWidth + lineAppendWidth;
  },
  // 清除当前的矩阵
  clearTotalMatrix() {
    this._cfg.totalMatrix = null;
    this._cfg.region = null;
  },
  clearBBox() {
    this._cfg.box = null;
    this._cfg.region = null;
  },
  getBBox() {
    let box = this._cfg.box;
    // 延迟计算
    if (!box) {
      box = this.calculateBox();
      if (box) {
        box.x = box.minX;
        box.y = box.minY;
        box.width = box.maxX - box.minX;
        box.height = box.maxY - box.minY;
      }
      this._cfg.box = box;
    }
    return box;
  }
});

module.exports = Shape;
