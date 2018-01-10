const Util = require('../util/index');
const Shape = require('../core/shape');
const Inside = require('./util/inside');

const Circle = function(cfg) {
  Circle.superclass.constructor.call(this, cfg);
};

Circle.ATTRS = {
  x: 0,
  y: 0,
  r: 0,
  lineWidth: 1
};

Util.extend(Circle, Shape);

Util.augment(Circle, {
  canFill: true,
  canStroke: true,
  type: 'circle',
  getDefaultAttrs() {
    return {
      lineWidth: 1
    };
  },
  calculateBox() {
    const attrs = this.__attrs;
    const cx = attrs.x;
    const cy = attrs.y;
    const r = attrs.r;
    const lineWidth = this.getHitLineWidth();
    const halfWidth = lineWidth / 2 + r;
    return {
      minX: cx - halfWidth,
      minY: cy - halfWidth,
      maxX: cx + halfWidth,
      maxY: cy + halfWidth
    };
  },
  isPointInPath(x, y) {
    const fill = this.hasFill();
    const stroke = this.hasStroke();
    if (fill && stroke) {
      return this.__isPointInFill(x, y) || this.__isPointInStroke(x, y);
    }

    if (fill) {
      return this.__isPointInFill(x, y);
    }

    if (stroke) {
      return this.__isPointInStroke(x, y);
    }

    return false;
  },
  __isPointInFill(x, y) {
    const attrs = this.__attrs;
    const cx = attrs.x;
    const cy = attrs.y;
    const r = attrs.r;

    return Inside.circle(cx, cy, r, x, y);
  },
  __isPointInStroke(x, y) {
    const attrs = this.__attrs;
    const cx = attrs.x;
    const cy = attrs.y;
    const r = attrs.r;
    const lineWidth = this.getHitLineWidth();

    return Inside.arcline(cx, cy, r, 0, Math.PI * 2, false, lineWidth, x, y);
  },
  createPath(context) {
    const attrs = this.__attrs;
    const cx = attrs.x;
    const cy = attrs.y;
    const r = attrs.r;
    context = context || self.get('context');

    context.beginPath();
    context.arc(cx, cy, r, 0, Math.PI * 2, false);
  }
});

module.exports = Circle;
