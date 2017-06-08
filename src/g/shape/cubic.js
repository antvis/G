/**
 * @fileOverview Cubic
 * @author hankaiai@126.com
 * @ignore
 */
var Util = require('../../util/index');
var Shape = require('../core/shape');
var Inside = require('./util/inside');
var Arrow = require('./util/arrow');
var CubicMath = require('./math/cubic');
var Vector2 = require('@ali/g-matrix').Vector2;

var Cubic = function(cfg) {
  Cubic.superclass.constructor.call(this, cfg);
};

Cubic.ATTRS = {
  p1: null,
  p2: null,
  p3: null,
  p4: null,
  lineWidth: 1,
  arrow: false
};

Util.extend(Cubic, Shape);

Util.augment(Cubic, {
  canStroke: true,
  type: 'cubic',
  getDefaultAttrs: function() {
    return {
      lineWidth: 1
    };
  },
  calculateBox: function() {
    var attrs = this.__attrs;
    var p1 = attrs.p1;
    var p2 = attrs.p2;
    var p3 = attrs.p3;
    var p4 = attrs.p4;
    var i;
    var l;

    if (
      Util.isNil(p1) ||
      Util.isNil(p2) ||
      Util.isNil(p3) ||
      Util.isNil(p4)
    ) {
      return null;
    }
    var halfWidth = attrs.lineWidth / 2;

    var xDim = CubicMath.extrema(p1[0], p2[0], p3[0], p4[0]);
    for (i = 0, l = xDim.length; i < l; i++) {
      xDim[i] = CubicMath.at(p1[0], p2[0], p3[0], p4[0], xDim[i]);
    }
    var yDim = CubicMath.extrema(p1[1], p2[1], p3[1], p4[1]);
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
  isPointInPath: function(x, y) {
    var attrs = this.__attrs;
    var p1 = attrs.p1;
    var p2 = attrs.p2;
    var p3 = attrs.p3;
    var p4 = attrs.p4;
    var lineWidth = attrs.lineWidth;

    return Inside.cubicline(
      p1[0], p1[1],
      p2[0], p2[1],
      p3[0], p3[1],
      p4[0], p4[1],
      lineWidth, x, y
    );
  },
  createPath: function(context) {
    var attrs = this.__attrs;
    var p1 = attrs.p1;
    var p2 = attrs.p2;
    var p3 = attrs.p3;
    var p4 = attrs.p4;
    var lineWidth = attrs.lineWidth;
    var arrow = attrs.arrow;
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

    if (arrow) {
      var v = new Vector2(p4[0] - p3[0], p4[1] - p3[1]);
      var end = Arrow.getEndPoint(v, new Vector2(p4[0], p4[1]), lineWidth);
      context.bezierCurveTo(p2[0], p2[1], p3[0], p3[1], end.x, end.y);
      Arrow.makeArrow(context, v, end, lineWidth);
    } else {
      context.bezierCurveTo(p2[0], p2[1], p3[0], p3[1], p4[0], p4[1]);
    }
  },
  getPoint: function(t) {
    var attrs = this.__attrs;
    return {
      x: CubicMath.at(attrs.p4[0], attrs.p3[0], attrs.p2[0], attrs.p1[0], t),
      y: CubicMath.at(attrs.p4[1], attrs.p3[1], attrs.p2[1], attrs.p1[1], t)
    };
  }
});

module.exports = Cubic;
