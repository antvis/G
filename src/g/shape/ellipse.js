/**
 * @fileOverview Ellipse
 * @author dxq613@gmail.com
 * @author hankaiai@126.com
 * @ignore
 */
const Util = require('../../util/index');
const Shape = require('../core/shape');
const Inside = require('./util/inside');
const Matrix = require('@ali/g-matrix');
const Matrix3 = Matrix.Matrix3;
const Vector3 = Matrix.Vector3;

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
    const lineWidth = attrs.lineWidth;
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

    const p = new Vector3(x, y, 1);
    const m = new Matrix3();
    m.scale(scaleX, scaleY);
    m.translate(cx, cy);
    const inm = m.getInverse();
    p.applyMatrix(inm);

    return Inside.circle(0, 0, r, p.x, p.y);
  },
  __isPointInStroke(x, y) {
    const attrs = this.__attrs;
    const cx = attrs.x;
    const cy = attrs.y;
    const rx = attrs.rx;
    const ry = attrs.ry;
    const lineWidth = attrs.lineWidth;

    const r = (rx > ry) ? rx : ry;
    const scaleX = (rx > ry) ? 1 : rx / ry;
    const scaleY = (rx > ry) ? ry / rx : 1;

    const p = new Vector3(x, y, 1);
    const m = new Matrix3();
    m.scale(scaleX, scaleY);
    m.translate(cx, cy);
    const inm = m.getInverse();
    p.applyMatrix(inm);

    return Inside.arcline(0, 0, r, 0, Math.PI * 2, false, lineWidth, p.x, p.y);
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

    const m = new Matrix3();
    m.scale(scaleX, scaleY);
    m.translate(cx, cy);
    const mo = m.to2DObject();
    context.beginPath();
    context.save();
    context.transform(mo.a, mo.b, mo.c, mo.d, mo.e, mo.f);
    context.arc(0, 0, r, 0, Math.PI * 2);
    context.restore();
    context.closePath();
  }
});

module.exports = Ellipse;
