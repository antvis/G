/**
 * @fileOverview Quadratic
 * @author hankaiai@126.com
 * @ignore
 */
var Util = require('@ali/g-util');
var Shape = require('../core/shape');
var Inside = require('./util/inside');
var Arrow = require('./util/arrow');
var QuadraticMath = require('./math/quadratic');
var Vector2 = require('@ali/g-matrix').Vector2;

var Quadratic = function(cfg) {
  Quadratic.superclass.constructor.call(this, cfg);
};

Quadratic.ATTRS = {
  p1: null,
  p2: null,
  p3: null,
  lineWidth: 1,
  arrow: false
};

Util.extend(Quadratic, Shape);

Util.augment(Quadratic, {
  canStroke: true,
  type: 'quadratic',
  getDefaultAttrs: function() {
    return {
      lineWidth: 1,
      arrow: false
    };
  },
  calculateBox: function() {
    var self = this;
    var attrs = self.__attrs;
    var p1 = attrs.p1;
    var p2 = attrs.p2;
    var p3 = attrs.p3;
    var i;
    var l;

    if (
      Util.isNull(p1) ||
      Util.isNull(p2) ||
      Util.isNull(p3)
    ) {
      return null;
    }
    var halfWidth = attrs.lineWidth / 2;


    var xDims = QuadraticMath.extrema(p1[0], p2[0], p3[0]);
    for (i = 0, l = xDims.length; i < l; i++) {
      xDims[i] = QuadraticMath.at(p1[0], p2[0], p3[0], xDims[i]);
    }
    xDims.push(p1[0], p3[0]);
    var yDims = QuadraticMath.extrema(p1[1], p2[1], p3[1]);
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
  isPointInPath: function(x, y) {
    var self = this;
    var attrs = self.__attrs;
    var p1 = attrs.p1;
    var p2 = attrs.p2;
    var p3 = attrs.p3;
    var lineWidth = attrs.lineWidth;

    return Inside.quadraticline(
      p1[0], p1[1],
      p2[0], p2[1],
      p3[0], p3[1],
      lineWidth, x, y
    );
  },
  createPath: function(context) {
    var self = this;
    var attrs = self.__attrs;
    var p1 = attrs.p1;
    var p2 = attrs.p2;
    var p3 = attrs.p3;
    var lineWidth = attrs.lineWidth;
    var arrow = attrs.arrow;

    if (
      Util.isNull(p1) ||
      Util.isNull(p2) ||
      Util.isNull(p3)
    ) {
      return;
    }
    context = context || self.get('context');
    context.beginPath();
    context.moveTo(p1[0], p1[1]);


    if (arrow) {
      var v = new Vector2(p3[0] - p2[0], p3[1] - p2[1]);
      var end = Arrow.getEndPoint(v, new Vector2(p3[0], p3[1]), lineWidth);
      context.quadraticCurveTo(p2[0], p2[1], end.x, end.y);
      Arrow.makeArrow(context, v, end, lineWidth);
    } else {
      context.quadraticCurveTo(p2[0], p2[1], p3[0], p3[1]);
    }
  },
  getPoint: function(t) {
    var attrs = this.__attrs;
    return {
      x: QuadraticMath.at(attrs.p1[0], attrs.p2[0], attrs.p3[0], t),
      y: QuadraticMath.at(attrs.p1[1], attrs.p2[1], attrs.p3[1], t)
    };
  }
});

module.exports = Quadratic;
