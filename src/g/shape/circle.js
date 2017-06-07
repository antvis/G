/**
 * @fileOverview circle
 * @author dxq613@gmail.com
 * @author hankaiai@126.com
 * @ignore
 */
var Util = require('../../util/index');
var Shape = require('../core/shape');
var Inside = require('./util/inside');

var Circle = function(cfg) {
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
  getDefaultAttrs: function() {
    return {
      lineWidth: 1
    };
  },
  calculateBox: function() {
    var attrs = this.__attrs;
    var cx = attrs.x;
    var cy = attrs.y;
    var r = attrs.r;
    var lineWidth = attrs.lineWidth;
    var halfWidth = lineWidth / 2 + r;
    return {
      minX: cx - halfWidth,
      minY: cy - halfWidth,
      maxX: cx + halfWidth,
      maxY: cy + halfWidth
    };
  },
  isPointInPath: function(x, y) {
    var fill = this.hasFill();
    var stroke = this.hasStroke();
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
  __isPointInFill: function(x, y) {
    var attrs = this.__attrs;
    var cx = attrs.x;
    var cy = attrs.y;
    var r = attrs.r;

    return Inside.circle(cx, cy, r, x, y);
  },
  __isPointInStroke: function(x, y) {
    var attrs = this.__attrs;
    var cx = attrs.x;
    var cy = attrs.y;
    var r = attrs.r;
    var lineWidth = attrs.lineWidth;

    return Inside.arcline(cx, cy, r, 0, Math.PI * 2, false, lineWidth, x, y);
  },
  createPath: function(context) {
    var attrs = this.__attrs;
    var cx = attrs.x;
    var cy = attrs.y;
    var r = attrs.r;
    context = context || self.get('context');

    context.beginPath();
    context.arc(cx, cy, r, 0, Math.PI * 2, false);
  }
});

module.exports = Circle;
