/**
 * @fileOverview 矩形
 * @author dxq613@gmail.com
 * @author hankaiai@126.com
 * @ignore
 */
var Util = require('@ali/g-util');
var Shape = require('../core/shape');
var Inside = require('./util/inside');

var Rect = function(cfg) {
  Rect.superclass.constructor.call(this, cfg);
};

Rect.ATTRS = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  radius: 0,
  lineWidth: 1
};

Util.extend(Rect, Shape);

Util.augment(Rect, {
  canFill: true,
  canStroke: true,
  type: 'rect',
  getDefaultAttrs: function() {
    return {
      lineWidth: 1,
      radius: 0
    };
  },
  calculateBox: function() {
    var self = this;
    var attrs = self.__attrs;
    var x = attrs.x;
    var y = attrs.y;
    var width = attrs.width;
    var height = attrs.height;
    var lineWidth = attrs.lineWidth;

    var halfWidth = lineWidth / 2;
    return {
      minX: x - halfWidth,
      minY: y - halfWidth,
      maxX: x + width + halfWidth,
      maxY: y + height + halfWidth
    };
  },
  isPointInPath: function(x, y) {
    var self = this;
    var fill = self.hasFill();
    var stroke = self.hasStroke();

    if (fill && stroke) {
      return self.__isPointInFill(x, y) || self.__isPointInStroke(x, y);
    }

    if (fill) {
      return self.__isPointInFill(x, y);
    }

    if (stroke) {
      return self.__isPointInStroke(x, y);
    }

    return false;
  },
  __isPointInFill: function(x, y) {
    var context = this.get('context');

    if (!context) return false;
    this.createPath();
    return context.isPointInPath(x, y);
  },
  __isPointInStroke: function(x, y) {
    var self = this;
    var attrs = self.__attrs;
    var rx = attrs.x;
    var ry = attrs.y;
    var width = attrs.width;
    var height = attrs.height;
    var radius = attrs.radius;
    var lineWidth = attrs.lineWidth;

    if (radius === 0) {
      var halfWidth = lineWidth / 2;
      return Inside.line(rx - halfWidth, ry, rx + width + halfWidth, ry, lineWidth, x, y) ||
        Inside.line(rx + width, ry - halfWidth, rx + width, ry + height + halfWidth, lineWidth, x, y) ||
        Inside.line(rx + width + halfWidth, ry + height, rx - halfWidth, ry + height, lineWidth, x, y) ||
        Inside.line(rx, ry + height + halfWidth, rx, ry - halfWidth, lineWidth, x, y);
    }

    return Inside.line(rx + radius, ry, rx + width - radius, ry, lineWidth, x, y) ||
      Inside.line(rx + width, ry + radius, rx + width, ry + height - radius, lineWidth, x, y) ||
      Inside.line(rx + width - radius, ry + height, rx + radius, ry + height, lineWidth, x, y) ||
      Inside.line(rx, ry + height - radius, rx, ry + radius, lineWidth, x, y) ||
      Inside.arcline(rx + width - radius, ry + radius, radius, 1.5 * Math.PI, 2 * Math.PI, false, lineWidth, x, y) ||
      Inside.arcline(rx + width - radius, ry + height - radius, radius, 0, 0.5 * Math.PI, false, lineWidth, x, y) ||
      Inside.arcline(rx + radius, ry + height - radius, radius, 0.5 * Math.PI, Math.PI, false, lineWidth, x, y) ||
      Inside.arcline(rx + radius, ry + radius, radius, Math.PI, 1.5 * Math.PI, false, lineWidth, x, y);
  },
  createPath: function(context) {
    var self = this;
    var attrs = self.__attrs;
    var x = attrs.x;
    var y = attrs.y;
    var width = attrs.width;
    var height = attrs.height;
    var radius = attrs.radius;
    context = context || self.get('context');

    context.beginPath();
    if (radius === 0) {
      // 改成原生的rect方法
      context.rect(x, y, width, height);
    } else {
      context.moveTo(x + radius, y);
      context.lineTo(x + width - radius, y);
      context.arc(x + width - radius, y + radius, radius, -Math.PI / 2, 0, false);
      context.lineTo(x + width, y + height - radius);
      context.arc(x + width - radius, y + height - radius, radius, 0, Math.PI / 2, false);
      context.lineTo(x + radius, y + height);
      context.arc(x + radius, y + height - radius, radius, Math.PI / 2, Math.PI, false);
      context.lineTo(x, y + radius);
      context.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 3 / 2, false);
      context.closePath();
    }
  }
});

module.exports = Rect;
