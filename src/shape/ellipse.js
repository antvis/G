const Util = require('../util/index');
const Shape = require('../core/shape');
const Inside = require('./util/inside');
const mat3 = require('../util/matrix').mat3;
const vec3 = require('../util/matrix').vec3;

const Ellipse = function(cfg) {
  Ellipse.superclass.constructor.call(this, cfg);
};

Ellipse.ATTRS = {
  x: 0,
  y: 0,
  rx: 1,
  ry: 1,
  lineWidth: 1
};

Util.extend(Ellipse, Shape);

Util.augment(Ellipse, {
  canFill: true,
  canStroke: true,
  type: 'ellipse',
  getDefaultAttrs() {
    return {
      lineWidth: 1
    };
  },
  calculateBox() {
    const attrs = this.__attrs;
    const cx = attrs.x;
    const cy = attrs.y;
    const rx = attrs.rx;
    const ry = attrs.ry;
    const lineWidth = this.getHitLineWidth();
    const halfXWidth = rx + lineWidth / 2;
    const halfYWidth = ry + lineWidth / 2;

    return {
      minX: cx - halfXWidth,
      minY: cy - halfYWidth,
      maxX: cx + halfXWidth,
      maxY: cy + halfYWidth
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
    const rx = attrs.rx;
    const ry = attrs.ry;

    const r = (rx > ry) ? rx : ry;
    const scaleX = (rx > ry) ? 1 : rx / ry;
    const scaleY = (rx > ry) ? ry / rx : 1;

    const p = [ x, y, 1 ];
    const m = [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ];
    mat3.scale(m, m, [ scaleX, scaleY ]);
    mat3.translate(m, m, [ cx, cy ]);
    const inm = mat3.invert([], m);
    vec3.transformMat3(p, p, inm);

    return Inside.circle(0, 0, r, p[0], p[1]);
  },
  __isPointInStroke(x, y) {
    const attrs = this.__attrs;
    const cx = attrs.x;
    const cy = attrs.y;
    const rx = attrs.rx;
    const ry = attrs.ry;
    const lineWidth = this.getHitLineWidth();

    const r = (rx > ry) ? rx : ry;
    const scaleX = (rx > ry) ? 1 : rx / ry;
    const scaleY = (rx > ry) ? ry / rx : 1;
    const p = [ x, y, 1 ];
    const m = [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ];
    mat3.scale(m, m, [ scaleX, scaleY ]);
    mat3.translate(m, m, [ cx, cy ]);
    const inm = mat3.invert([], m);
    vec3.transformMat3(p, p, inm);

    return Inside.arcline(0, 0, r, 0, Math.PI * 2, false, lineWidth, p[0], p[1]);
  },
  createPath(context) {
    const attrs = this.__attrs;
    const cx = attrs.x;
    const cy = attrs.y;
    const rx = attrs.rx;
    const ry = attrs.ry;

    context = context || self.get('context');
    const r = (rx > ry) ? rx : ry;
    const scaleX = (rx > ry) ? 1 : rx / ry;
    const scaleY = (rx > ry) ? ry / rx : 1;

    const m = [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ];
    mat3.scale(m, m, [ scaleX, scaleY ]);
    mat3.translate(m, m, [ cx, cy ]);
    context.beginPath();
    context.save();
    context.transform(m[0], m[1], m[3], m[4], m[6], m[7]);
    context.arc(0, 0, r, 0, Math.PI * 2);
    context.restore();
    context.closePath();
  }
});

module.exports = Ellipse;
