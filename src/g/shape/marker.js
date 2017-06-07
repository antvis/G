var Util = require('@ali/g-util');
var Shape = require('../core/shape');
var Inside = require('./util/inside');

var Marker = function(cfg) {
  Marker.superclass.constructor.call(this, cfg);
};

Marker.Symbols = {
  // 圆
  circle: function(x, y, r, ctx) {
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
  },
  // 正方形
  square: function(x, y, r, ctx) {
    ctx.moveTo(x - r, y - r);
    ctx.lineTo(x + r, y - r);
    ctx.lineTo(x + r, y + r);
    ctx.lineTo(x - r, y + r);
    ctx.closePath();
  },
  // 菱形
  diamond: function(x, y, r, ctx) {
    ctx.moveTo(x - r, y);
    ctx.lineTo(x, y - r);
    ctx.lineTo(x + r, y);
    ctx.lineTo(x, y + r);
    ctx.closePath();
  },
  // 三角形
  triangle: function(x, y, r, ctx) {
    var diffX = r / 0.966;
    var diffY = r;
    ctx.moveTo(x, y - r);
    ctx.lineTo(x + diffX, y + diffY);
    ctx.lineTo(x - diffX, y + diffY);
    ctx.closePath();
  },
  // 倒三角形
  'triangle-down': function(x, y, r, ctx) {
    var diffX = r / 0.966;
    var diffY = r;
    ctx.moveTo(x, y + r);
    ctx.lineTo(x + diffX, y - diffY);
    ctx.lineTo(x - diffX, y - diffY);
    ctx.closePath();
  }
};

Marker.ATTRS = {
  path: null,
  lineWidth: 1
};

Util.extend(Marker, Shape);

Util.augment(Marker, {
  type: 'marker',
  canFill: true,
  canStroke: true,
  getDefaultAttrs: function() {
    return {
      x: 0,
      y: 0,
      lineWidth: 1
    };
  },
  calculateBox: function() {
    var attrs = this.__attrs;
    var cx = attrs.x;
    var cy = attrs.y;
    var r = attrs.radius;
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
    var attrs = this.__attrs;
    var cx = attrs.x;
    var cy = attrs.y;
    var r = attrs.radius;
    return Inside.circle(cx, cy, r, x, y);
  },
  createPath: function(context) {
    var attrs = this.__attrs;
    var x = attrs.x;
    var y = attrs.y;
    var r = attrs.radius;
    var symbol = attrs.symbol || 'circle';
    var method;
    if (Util.isFunction(symbol)) {
      method = symbol;
    } else {
      method = Marker.Symbols[symbol];
    }
    context.beginPath();
    method(x, y, r, context);
  }/**/
});

module.exports = Marker;
