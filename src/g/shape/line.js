const Util = require('../../util/index');
const Shape = require('../core/shape');
const Inside = require('./util/inside');
const Arrow = require('./util/arrow');
const LineMath = require('./math/line');
const vec2 = require('../../util/matrix').vec2;

const Line = function(cfg) {
  Line.superclass.constructor.call(this, cfg);
};

Line.ATTRS = {
  x1: 0,
  y1: 0,
  x2: 0,
  y2: 0,
  lineWidth: 1,
  arrow: false
};

Util.extend(Line, Shape);

Util.augment(Line, {
  canStroke: true,
  type: 'line',
  getDefaultAttrs() {
    return {
      lineWidth: 1,
      arrow: false
    };
  },
  calculateBox() {
    const attrs = this.__attrs;
    const x1 = attrs.x1;
    const y1 = attrs.y1;
    const x2 = attrs.x2;
    const y2 = attrs.y2;
    const lineWidth = attrs.lineWidth;

    return LineMath.box(x1, y1, x2, y2, lineWidth);
  },
  isPointInPath(x, y) {
    const attrs = this.__attrs;
    const x1 = attrs.x1;
    const y1 = attrs.y1;
    const x2 = attrs.x2;
    const y2 = attrs.y2;
    const lineWidth = attrs.lineWidth;
    if (this.hasStroke()) {
      return Inside.line(x1, y1, x2, y2, lineWidth, x, y);
    }

    return false;
  },
  createPath(context) {
    const attrs = this.__attrs;
    const x1 = attrs.x1;
    const y1 = attrs.y1;
    const x2 = attrs.x2;
    const y2 = attrs.y2;
    const arrow = attrs.arrow;
    const lineWidth = attrs.lineWidth;
    context = context || self.get('context');
    context.beginPath();
    context.moveTo(x1, y1);
    if (arrow) {
      const v = vec2.fromValues(x2 - x1, y2 - y1);
      const end = Arrow.getEndPoint(v, vec2.fromValues(x2, y2), lineWidth);
      context.lineTo(end[0], end[1]);
      Arrow.makeArrow(context, v, end, lineWidth);
    } else {
      context.lineTo(x2, y2);
    }
  },
  getPoint(t) {
    const attrs = this.__attrs;
    return {
      x: LineMath.at(attrs.x1, attrs.x2, t),
      y: LineMath.at(attrs.y1, attrs.y2, t)
    };
  }
});

module.exports = Line;
