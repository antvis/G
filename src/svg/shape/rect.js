const Util = require('../../util/index');
const Shape = require('../core/shape');

const Rect = function(cfg) {
  Rect.superclass.constructor.call(this, cfg);
};

Rect.ATTRS = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  radius: 0,
  lineWidth: 1,
  fill: 'none'
};

Util.extend(Rect, Shape);

Util.augment(Rect, {
  canFill: true,
  canStroke: true,
  type: 'rect',
  getDefaultAttrs() {
    return {
      lineWidth: 1,
      fill: 'none'
    };
  },
  _afterSetRadius() {
    const el = this.get('el');
    el.setAttribute('rx', this.__attrs.radius);
    el.setAttribute('ry', this.__attrs.radius);
  },
  _afterSetAttrAll(objs) {
    if ('radius' in objs) {
      this._afterSetRadius();
    }
  }
});

module.exports = Rect;
