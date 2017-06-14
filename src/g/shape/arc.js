const Util = require('../../util/index');
const vec2 = require('../../util/matrix').vec2;
const Shape = require('../core/shape');
const Inside = require('./util/inside');
const ArcMath = require('./math/arc');
const Arrow = require('./util/arrow');

const Arc = function(cfg) {
  Arc.superclass.constructor.call(this, cfg);
};

Arc.ATTRS = {
  x: 0,
  y: 0,
  r: 0,
  startAngle: 0,
  endAngle: 0,
  clockwise: false,
  lineWidth: 1,
  arrow: false
};

Util.extend(Arc, Shape);

Util.augment(Arc, {
  canStroke: true,
  type: 'arc',
  getDefaultAttrs() {
    return {
      x: 0,
      y: 0,
      r: 0,
      startAngle: 0,
      endAngle: 0,
      clockwise: false,
      lineWidth: 1,
      arrow: false
    };
  },
  calculateBox() {
    const attrs = this.__attrs;
    const cx = attrs.x;
    const cy = attrs.y;
    const r = attrs.r;
    const startAngle = attrs.startAngle;
    const endAngle = attrs.endAngle;
    const clockwise = attrs.clockwise;
    const lineWidth = attrs.lineWidth;
    const halfWidth = lineWidth / 2;
    const box = ArcMath.box(cx, cy, r, startAngle, endAngle, clockwise);
    box.minX -= halfWidth;
    box.minY -= halfWidth;
    box.maxX += halfWidth;
    box.maxY += halfWidth;
    return box;
  },
  isPointInPath(x, y) {
    const attrs = this.__attrs;
    const cx = attrs.x;
    const cy = attrs.y;
    const r = attrs.r;
    const startAngle = attrs.startAngle;
    const endAngle = attrs.endAngle;
    const clockwise = attrs.clockwise;
    const lineWidth = attrs.lineWidth;

    if (this.hasStroke()) {
      return Inside.arcline(cx, cy, r, startAngle, endAngle, clockwise, lineWidth, x, y);
    }
    return false;
  },
  createPath(context) {
    const attrs = this.__attrs;
    const cx = attrs.x;
    const cy = attrs.y;
    const r = attrs.r;
    const startAngle = attrs.startAngle;
    const endAngle = attrs.endAngle;
    const clockwise = attrs.clockwise;
    const lineWidth = attrs.lineWidth;
    const arrow = attrs.arrow;
    context = context || self.get('context');

    context.beginPath();
    context.arc(cx, cy, r, startAngle, endAngle, clockwise);

    if (arrow) {
      const end = {
        x: cx + r * Math.cos(endAngle),
        y: cy + r * Math.sin(endAngle)
      };

      const v = [ -r * Math.sin(endAngle), r * Math.cos(endAngle) ];
      if (clockwise) {
        vec2.scale(v, v, -1);
      }
      Arrow.makeArrow(context, v, end, lineWidth);
    }
  }
});

module.exports = Arc;
