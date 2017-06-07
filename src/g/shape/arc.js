/**
 * @fileOverview arc
 * @author dxq613@gmail.com
 * @author hankaiai@126.com
 * @ignore
 */

var Util = require('../../util/index');
var Vector2 = require('@ali/g-matrix').Vector2;
var Shape = require('../core/shape');
var Inside = require('./util/inside');
var ArcMath = require('./math/arc');
var Arrow = require('./util/arrow');

var Arc = function(cfg) {
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
  getDefaultAttrs: function() {
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
  calculateBox: function() {
    var attrs = this.__attrs;
    var cx = attrs.x;
    var cy = attrs.y;
    var r = attrs.r;
    var startAngle = attrs.startAngle;
    var endAngle = attrs.endAngle;
    var clockwise = attrs.clockwise;
    var lineWidth = attrs.lineWidth;
    var halfWidth = lineWidth / 2;
    var box = ArcMath.box(cx, cy, r, startAngle, endAngle, clockwise);
    box.minX -= halfWidth;
    box.minY -= halfWidth;
    box.maxX += halfWidth;
    box.maxY += halfWidth;
    return box;
  },
  isPointInPath: function(x, y) {
    var attrs = this.__attrs;
    var cx = attrs.x;
    var cy = attrs.y;
    var r = attrs.r;
    var startAngle = attrs.startAngle;
    var endAngle = attrs.endAngle;
    var clockwise = attrs.clockwise;
    var lineWidth = attrs.lineWidth;

    if (this.hasStroke()) {
      return Inside.arcline(cx, cy, r, startAngle, endAngle, clockwise, lineWidth, x, y);
    }
    return false;
  },
  createPath: function(context) {
    var attrs = this.__attrs;
    var cx = attrs.x;
    var cy = attrs.y;
    var r = attrs.r;
    var startAngle = attrs.startAngle;
    var endAngle = attrs.endAngle;
    var clockwise = attrs.clockwise;
    var lineWidth = attrs.lineWidth;
    var arrow = attrs.arrow;
    context = context || self.get('context');

    context.beginPath();
    context.arc(cx, cy, r, startAngle, endAngle, clockwise);

    if (arrow) {
      var end = {
        x: cx + r * Math.cos(endAngle),
        y: cy + r * Math.sin(endAngle)
      };

      var v = new Vector2(-r * Math.sin(endAngle), r * Math.cos(endAngle));
      if (clockwise) {
        v.multiplyScaler(-1);
      }
      Arrow.makeArrow(context, v, end, lineWidth);
    }
  }
});

module.exports = Arc;
