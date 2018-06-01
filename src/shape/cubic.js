const Util = require('../util/index');
const Shape = require('../core/shape');
const Inside = require('./util/inside');
const Arrow = require('./util/arrow');
const CubicMath = require('./math/cubic');

const Cubic = function(cfg) {
  Cubic.superclass.constructor.call(this, cfg);
};

Cubic.ATTRS = {
  p1: null, // 起始点
  p2: null, // 第一个控制点
  p3: null, // 第二个控制点
  p4: null, // 终点
  lineWidth: 1,
  startArrow: false,
  endArrow: false
};

Util.extend(Cubic, Shape);

Util.augment(Cubic, {
  canStroke: true,
  type: 'cubic',
  getDefaultAttrs() {
    return {
      lineWidth: 1,
      startArrow: false,
      endArrow: false
    };
  },
  calculateBox() {
    const attrs = this.__attrs;
    const { p1, p2, p3, p4 } = attrs;
    const lineWidth = this.getHitLineWidth();
    let i;
    let l;

    if (
      Util.isNil(p1) ||
      Util.isNil(p2) ||
      Util.isNil(p3) ||
      Util.isNil(p4)
    ) {
      return null;
    }
    const halfWidth = lineWidth / 2;

    const xDim = CubicMath.extrema(p1[0], p2[0], p3[0], p4[0]);
    for (i = 0, l = xDim.length; i < l; i++) {
      xDim[i] = CubicMath.at(p1[0], p2[0], p3[0], p4[0], xDim[i]);
    }
    const yDim = CubicMath.extrema(p1[1], p2[1], p3[1], p4[1]);
    for (i = 0, l = yDim.length; i < l; i++) {
      yDim[i] = CubicMath.at(p1[1], p2[1], p3[1], p4[1], yDim[i]);
    }
    xDim.push(p1[0], p4[0]);
    yDim.push(p1[1], p4[1]);

    return {
      minX: Math.min.apply(Math, xDim) - halfWidth,
      maxX: Math.max.apply(Math, xDim) + halfWidth,
      minY: Math.min.apply(Math, yDim) - halfWidth,
      maxY: Math.max.apply(Math, yDim) + halfWidth
    };
  },
  isPointInPath(x, y) {
    const attrs = this.__attrs;
    const { p1, p2, p3, p4 } = attrs;
    const lineWidth = this.getHitLineWidth();
    return Inside.cubicline(
      p1[0], p1[1],
      p2[0], p2[1],
      p3[0], p3[1],
      p4[0], p4[1],
      lineWidth, x, y
    );
  },
  createPath(context) {
    const attrs = this.__attrs;
    const { p1, p2, p3, p4 } = attrs;
    context = context || self.get('context');
    if (
      Util.isNil(p1) ||
      Util.isNil(p2) ||
      Util.isNil(p3) ||
      Util.isNil(p4)
    ) {
      return;
    }
    context.beginPath();
    context.moveTo(p1[0], p1[1]);
    context.bezierCurveTo(p2[0], p2[1], p3[0], p3[1], p4[0], p4[1]);
  },
  afterPath(context) {
    const attrs = this.__attrs;
    const { p1, p2, p3, p4 } = attrs;
    context = context || this.get('context');
    if (attrs.startArrow) {
      Arrow.addStartArrow(context, attrs, p2[0], p2[1], p1[0], p1[1]);
    }
    if (attrs.endArrow) {
      Arrow.addEndArrow(context, attrs, p3[0], p3[1], p4[0], p4[1]);
    }
  },
  getPoint(t) {
    const attrs = this.__attrs;
    return {
      x: CubicMath.at(attrs.p4[0], attrs.p3[0], attrs.p2[0], attrs.p1[0], t),
      y: CubicMath.at(attrs.p4[1], attrs.p3[1], attrs.p2[1], attrs.p1[1], t)
    };
  }
});

module.exports = Cubic;
