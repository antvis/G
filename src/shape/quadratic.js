const Util = require('../util/index');
const Shape = require('../core/shape');
const Inside = require('./util/inside');
const Arrow = require('./util/arrow');
const QuadraticMath = require('./math/quadratic');

const Quadratic = function(cfg) {
  Quadratic.superclass.constructor.call(this, cfg);
};

Quadratic.ATTRS = {
  p1: null, // 起始点
  p2: null, // 控制点
  p3: null, // 结束点
  lineWidth: 1,
  startArrow: false,
  endArrow: false
};

Util.extend(Quadratic, Shape);

Util.augment(Quadratic, {
  canStroke: true,
  type: 'quadratic',
  getDefaultAttrs() {
    return {
      lineWidth: 1,
      startArrow: false,
      endArrow: false
    };
  },
  calculateBox() {
    const self = this;
    const attrs = self.__attrs;
    const { p1, p2, p3 } = attrs;
    const lineWidth = this.getHitLineWidth();
    let i;
    let l;

    if (
      Util.isNil(p1) ||
      Util.isNil(p2) ||
      Util.isNil(p3)
    ) {
      return null;
    }
    const halfWidth = lineWidth / 2;
    const xDims = QuadraticMath.extrema(p1[0], p2[0], p3[0]);
    for (i = 0, l = xDims.length; i < l; i++) {
      xDims[i] = QuadraticMath.at(p1[0], p2[0], p3[0], xDims[i]);
    }
    xDims.push(p1[0], p3[0]);
    const yDims = QuadraticMath.extrema(p1[1], p2[1], p3[1]);
    for (i = 0, l = yDims.length; i < l; i++) {
      yDims[i] = QuadraticMath.at(p1[1], p2[1], p3[1], yDims[i]);
    }
    yDims.push(p1[1], p3[1]);

    return {
      minX: Math.min.apply(Math, xDims) - halfWidth,
      maxX: Math.max.apply(Math, xDims) + halfWidth,
      minY: Math.min.apply(Math, yDims) - halfWidth,
      maxY: Math.max.apply(Math, yDims) + halfWidth
    };
  },
  isPointInPath(x, y) {
    const self = this;
    const attrs = self.__attrs;
    const { p1, p2, p3 } = attrs;
    const lineWidth = this.getHitLineWidth();

    return Inside.quadraticline(
      p1[0], p1[1],
      p2[0], p2[1],
      p3[0], p3[1],
      lineWidth, x, y
    );
  },
  createPath(context) {
    const self = this;
    const attrs = self.__attrs;
    const { p1, p2, p3 } = attrs;

    if (
      Util.isNil(p1) ||
      Util.isNil(p2) ||
      Util.isNil(p3)
    ) {
      return;
    }
    context = context || self.get('context');
    context.beginPath();
    context.moveTo(p1[0], p1[1]);
    context.quadraticCurveTo(p2[0], p2[1], p3[0], p3[1]);

  },
  afterPath(context) {
    const self = this;
    const attrs = self.__attrs;
    const { p1, p2, p3 } = attrs;
    context = context || self.get('context');

    if (attrs.startArrow) {
      Arrow.addStartArrow(context, attrs, p2[0], p2[1], p1[0], p1[1]);
    }

    if (attrs.endArrow) {
      Arrow.addEndArrow(context, attrs, p2[0], p2[1], p3[0], p3[1]);
    }
  },
  getPoint(t) {
    const attrs = this.__attrs;
    return {
      x: QuadraticMath.at(attrs.p1[0], attrs.p2[0], attrs.p3[0], t),
      y: QuadraticMath.at(attrs.p1[1], attrs.p2[1], attrs.p3[1], t)
    };
  }
});

module.exports = Quadratic;
