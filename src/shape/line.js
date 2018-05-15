const Util = require('../util/index');
const Shape = require('../core/shape');
const LineMath = require('./math/line');

const Line = function(cfg) {
  Line.superclass.constructor.call(this, cfg);
};

Line.ATTRS = {
  x1: 0,
  y1: 0,
  x2: 0,
  y2: 0,
  lineWidth: 1,
  startArrow: false,
  endArrow: false
};

Util.extend(Line, Shape);

Util.augment(Line, {
  canStroke: true,
  type: 'line',
  getDefaultAttrs() {
    return {
      lineWidth: 1,
      stroke: '#000',
      startArrow: false,
      endArrow: false
    };
  },
  __afterSetAttrStroke(value) {
    const start = this.get('marker-start');
    const end = this.get('marker-end');
    if (start) {
      this.get('defs').findById(start).update(value);
    }
    if (end) {
      this.get('defs').findById(end).update(value);
    }
  },
  __afterSetAttrAll(objs) {
    if (objs.stroke) {
      this.__afterSetAttrStroke(objs.stroke);
    }
  },
  createPath() {},
  getPoint(t) {
    const attrs = this.__attrs;
    return {
      x: LineMath.at(attrs.x1, attrs.x2, t),
      y: LineMath.at(attrs.y1, attrs.y2, t)
    };
  }
});

module.exports = Line;
