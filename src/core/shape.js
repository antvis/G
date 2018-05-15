const Util = require('../util/index');
const Element = require('./element');
const Inside = require('../shape/util/inside');

const SHAPES = [ 'circle', 'ellipse', 'fan', 'image', 'line', 'marker', 'path', 'polygon', 'rect', 'text' ];

const Shape = function(cfg) {
  Shape.superclass.constructor.call(this, cfg);
};

Shape.ATTRS = {};

Util.extend(Shape, Element);

Util.augment(Shape, {
  isShape: true,
  createPath() {},
  init(id) {
    Shape.superclass.init.call(this);
    if (~SHAPES.indexOf(this.type)) {
      const shape = document.createElementNS('http://www.w3.org/2000/svg', this.type);
      id = id || Util.uniqueId(this.type + '_');
      shape.setAttribute('id', id);
      this.setSilent('el', shape);
      this.setSilent('id', id);
    }
  },
  /**
   * 节点是否在图形中
   * @param  {Number}  x x 坐标
   * @param  {Number}  y y 坐标
   * @return {Boolean}  是否在图形中
   */
  isPointInPath() {
    return false;
  },
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
    const clip = self.__attrs.clip;
    if (clip) {
      if (clip.inside(x, y)) {
        return self.isPointInPath(v[0], v[1]);
      }
    } else {
      return self.isPointInPath(v[0], v[1]);
    }
    return false;
  },
  /**
   * @protected
   * @protected
   * 计算包围盒
   * @return {Object} 包围盒
   */
  calculateBox() {
    return null;
  },
  // 获取拾取时线的宽度，需要考虑附加的线的宽度
  getHitLineWidth() {
    const attrs = this.__attrs;
    // if (!attrs.stroke) {
    //   return 0;
    // }
    const lineAppendWidth = attrs.lineAppendWidth || 0;
    const lineWidth = attrs.lineWidth || 0;
    return lineWidth + lineAppendWidth;
  },
  // 清除当前的矩阵
  clearTotalMatrix() {
    this.__cfg.totalMatrix = null;
    this.__cfg.region = null;
  },
  clearBBox() {
    this.__cfg.box = null;
    this.__cfg.region = null;
  }
});

module.exports = Shape;
