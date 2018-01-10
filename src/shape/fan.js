const Util = require('../util/index');
const Shape = require('../core/shape');
const Inside = require('./util/inside');
const ArcMath = require('./math/arc');
const vec2 = require('../util/matrix').vec2;

const Fan = function(cfg) {
  Fan.superclass.constructor.call(this, cfg);
};

Fan.ATTRS = {
  x: 0,
  y: 0,
  rs: 0,
  re: 0,
  startAngle: 0,
  endAngle: 0,
  clockwise: false,
  lineWidth: 1
};

Util.extend(Fan, Shape);

Util.augment(Fan, {
  canFill: true,
  canStroke: true,
  type: 'fan',
  getDefaultAttrs() {
    return {
      clockwise: false,
      lineWidth: 1,
      rs: 0,
      re: 0
    };
  },
  calculateBox() {
    const self = this;
    const attrs = self.__attrs;
    const cx = attrs.x;
    const cy = attrs.y;
    const rs = attrs.rs;
    const re = attrs.re;
    const startAngle = attrs.startAngle;
    const endAngle = attrs.endAngle;
    const clockwise = attrs.clockwise;
    const lineWidth = this.getHitLineWidth();

    const boxs = ArcMath.box(cx, cy, rs, startAngle, endAngle, clockwise);
    const boxe = ArcMath.box(cx, cy, re, startAngle, endAngle, clockwise);
    const minX = Math.min(boxs.minX, boxe.minX);
    const minY = Math.min(boxs.minY, boxe.minY);
    const maxX = Math.max(boxs.maxX, boxe.maxX);
    const maxY = Math.max(boxs.maxY, boxe.maxY);

    const halfWidth = lineWidth / 2;
    return {
      minX: minX - halfWidth,
      minY: minY - halfWidth,
      maxX: maxX + halfWidth,
      maxY: maxY + halfWidth
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
    const rs = attrs.rs;
    const re = attrs.re;
    const startAngle = attrs.startAngle;
    const endAngle = attrs.endAngle;
    const clockwise = attrs.clockwise;
    const v1 = [ 1, 0 ];
    const subv = [ x - cx, y - cy ];
    const angle = vec2.angleTo(v1, subv);


    const angle1 = ArcMath.nearAngle(angle, startAngle, endAngle, clockwise);

    if (Util.isNumberEqual(angle, angle1)) {
      const ls = vec2.squaredLength(subv);
      if (rs * rs <= ls && ls <= re * re) {
        return true;
      }
    }
    return false;
  },
  __isPointInStroke(x, y) {
    const attrs = this.__attrs;
    const cx = attrs.x;
    const cy = attrs.y;
    const rs = attrs.rs;
    const re = attrs.re;
    const startAngle = attrs.startAngle;
    const endAngle = attrs.endAngle;
    const clockwise = attrs.clockwise;
    const lineWidth = this.getHitLineWidth();

    const ssp = {
      x: Math.cos(startAngle) * rs + cx,
      y: Math.sin(startAngle) * rs + cy
    };
    const sep = {
      x: Math.cos(startAngle) * re + cx,
      y: Math.sin(startAngle) * re + cy
    };
    const esp = {
      x: Math.cos(endAngle) * rs + cx,
      y: Math.sin(endAngle) * rs + cy
    };
    const eep = {
      x: Math.cos(endAngle) * re + cx,
      y: Math.sin(endAngle) * re + cy
    };

    if (Inside.line(ssp.x, ssp.y, sep.x, sep.y, lineWidth, x, y)) {
      return true;
    }

    if (Inside.line(esp.x, esp.y, eep.x, eep.y, lineWidth, x, y)) {
      return true;
    }

    if (Inside.arcline(cx, cy, rs, startAngle, endAngle, clockwise, lineWidth, x, y)) {
      return true;
    }

    if (Inside.arcline(cx, cy, re, startAngle, endAngle, clockwise, lineWidth, x, y)) {
      return true;
    }

    return false;
  },
  createPath(context) {
    const attrs = this.__attrs;
    const cx = attrs.x;
    const cy = attrs.y;
    const rs = attrs.rs;
    const re = attrs.re;
    const startAngle = attrs.startAngle;
    const endAngle = attrs.endAngle;
    const clockwise = attrs.clockwise;

    const ssp = {
      x: Math.cos(startAngle) * rs + cx,
      y: Math.sin(startAngle) * rs + cy
    };
    const sep = {
      x: Math.cos(startAngle) * re + cx,
      y: Math.sin(startAngle) * re + cy
    };
    const esp = {
      x: Math.cos(endAngle) * rs + cx,
      y: Math.sin(endAngle) * rs + cy
    };

    context = context || self.get('context');
    context.beginPath();
    context.moveTo(ssp.x, ssp.y);
    context.lineTo(sep.x, sep.y);
    context.arc(cx, cy, re, startAngle, endAngle, clockwise);
    context.lineTo(esp.x, esp.y);
    context.arc(cx, cy, rs, endAngle, startAngle, !clockwise);
    context.closePath();
  }
});

module.exports = Fan;
