/**
 * @fileOverview 直线
 * @author dxq613@gmail.com
 * @author hankaiai@126.com
 * @ignore
 */
var Util = require('../../util/index');
var Shape = require('../core/shape');
var Inside = require('./util/inside');
var Arrow = require('./util/arrow');
var LineMath = require('./math/line');
var Matrix = require('@ali/g-matrix');
var Vector2 = Matrix.Vector2;

var Line = function(cfg) {
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
  getDefaultAttrs: function() {
    return {
      lineWidth: 1,
      arrow: false
    };
  },
  calculateBox: function() {
    var attrs = this.__attrs;
    var x1 = attrs.x1;
    var y1 = attrs.y1;
    var x2 = attrs.x2;
    var y2 = attrs.y2;
    var lineWidth = attrs.lineWidth;

    return LineMath.box(x1, y1, x2, y2, lineWidth);
  },
  isPointInPath: function(x, y) {
    var attrs = this.__attrs;
    var x1 = attrs.x1;
    var y1 = attrs.y1;
    var x2 = attrs.x2;
    var y2 = attrs.y2;
    var lineWidth = attrs.lineWidth;
    if (this.hasStroke()) {
      return Inside.line(x1, y1, x2, y2, lineWidth, x, y);
    }

    return false;
  },
  createPath: function(context) {
    var attrs = this.__attrs;
    var x1 = attrs.x1;
    var y1 = attrs.y1;
    var x2 = attrs.x2;
    var y2 = attrs.y2;
    var arrow = attrs.arrow;
    var lineWidth = attrs.lineWidth;
    context = context || self.get('context');
    context.beginPath();
    context.moveTo(x1, y1);
    if (arrow) {
      var v = new Vector2(x2 - x1, y2 - y1);
      var end = Arrow.getEndPoint(v, new Vector2(x2, y2), lineWidth);
      context.lineTo(end.x, end.y);
      Arrow.makeArrow(context, v, end, lineWidth);
    } else {
      context.lineTo(x2, y2);
    }
  },
  getPoint: function(t) {
    var attrs = this.__attrs;
    return {
      x: LineMath.at(attrs.x1, attrs.x2, t),
      y: LineMath.at(attrs.y1, attrs.y2, t)
    };
  }
});

module.exports = Line;
