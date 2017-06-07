/**
 * @fileOverview polygon
 * @author dxq613@gmail.com
 * @author hankaiai@126.com
 * @ignore
 */
var Util = require('../../util/index');
var Shape = require('../core/shape');
var Inside = require('./util/inside');

var Polygon = function(cfg) {
  Polygon.superclass.constructor.call(this, cfg);
};

Polygon.ATTRS = {
  points: null,
  lineWidth: 1
};

Util.extend(Polygon, Shape);

Util.augment(Polygon, {
  canFill: true,
  canStroke: true,
  type: 'polygon',
  getDefaultAttrs: function() {
    return {
      lineWidth: 1
    };
  },
  calculateBox: function() {
    var self = this;
    var attrs = self.__attrs;
    var points = attrs.points;
    var lineWidth = attrs.lineWidth;
    if (!points || points.length === 0) {
      return null;
    }
    var minX = Infinity;
    var minY = Infinity;
    var maxX = -Infinity;
    var maxY = -Infinity;

    Util.each(points, function(point) {
      var x = point[0];
      var y = point[1];
      if (x < minX) {
        minX = x;
      }
      if (x > maxX) {
        maxX = x;
      }

      if (y < minY) {
        minY = y;
      }

      if (y > maxY) {
        maxY = y;
      }
    });

    var halfWidth = lineWidth / 2;
    return {
      minX: minX - halfWidth,
      minY: minY - halfWidth,
      maxX: maxX + halfWidth,
      maxY: maxY + halfWidth
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
    var self = this;
    var context = self.get('context');
    self.createPath();
    return context.isPointInPath(x, y);
  },
  __isPointInStroke: function(x, y) {
    var self = this;
    var attrs = self.__attrs;
    var points = attrs.points;
    if (points.length < 2) {
      return false;
    }
    var lineWidth = attrs.lineWidth;
    var outPoints = points.slice(0);
    if (points.length >= 3) {
      outPoints.push(points[0]);
    }

    return Inside.polyline(outPoints, lineWidth, x, y);
  },
  createPath: function(context) {
    var self = this;
    var attrs = self.__attrs;
    var points = attrs.points;
    if (points.length < 2) {
      return;
    }
    context = context || self.get('context');
    context.beginPath();
    Util.each(points, function(point, index) {
      if (index === 0) {
        context.moveTo(point[0], point[1]);
      } else {
        context.lineTo(point[0], point[1]);
      }
    });
    context.closePath();
  }
});

module.exports = Polygon;
