/**
 * @fileOverview polyline
 * @author dxq613@gmail.com
 * @author hankaiai@126.com
 * @ignore
 */
var Util = require('@ali/g-util');
var Shape = require('../core/shape');
var Inside = require('./util/inside');
var Arrow = require('./util/arrow');
var LineMath = require('./math/line');
var Matrix = require('@ali/g-matrix');
var Vector2 = Matrix.Vector2;

var Polyline = function(cfg) {
  Polyline.superclass.constructor.call(this, cfg);
};

Polyline.ATTRS = {
  points: null,
  lineWidth: 1,
  arrow: false,
  tCache: null
};

Util.extend(Polyline, Shape);

Util.augment(Polyline, {
  canStroke: true,
  type: 'polyline',
  tCache: null, // 缓存各点的t
  getDefaultAttrs: function() {
    return {
      lineWidth: 1,
      arrow: false
    };
  },
  calculateBox: function() {
    var self = this;
    var attrs = self.__attrs;
    var lineWidth = attrs.lineWidth;
    var points = attrs.points;
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
  __setTcache: function() {
    var self = this;
    var attrs = self.__attrs;
    var points = attrs.points;
    var totalLength = 0;
    var tempLength = 0;
    var tCache = [];
    var segmentT;
    var segmentL;
    if (!points || points.length === 0) {
      return;
    }

    Util.each(points, function(p, i) {
      if (points[i + 1]) {
        totalLength += LineMath.len(p[0], p[1], points[i + 1][0], points[i + 1][1]);
      }
    });
    if (totalLength <= 0) {
      return;
    }
    Util.each(points, function(p, i) {
      if (points[i + 1]) {
        segmentT = [];
        segmentT[0] = tempLength / totalLength;
        segmentL = LineMath.len(p[0], p[1], points[i + 1][0], points[i + 1][1]);
        tempLength += segmentL;
        segmentT[1] = tempLength / totalLength;
        tCache.push(segmentT);
      }
    });
    this.tCache = tCache;
  },
  isPointInPath: function(x, y) {
    var self = this;
    var attrs = self.__attrs;
    if (self.hasStroke()) {
      var points = attrs.points;
      if (points.length < 2) {
        return false;
      }
      var lineWidth = attrs.lineWidth;
      return Inside.polyline(points, lineWidth, x, y);
    }
    return false;
  },
  createPath: function(context) {
    var self = this;
    var attrs = self.__attrs;
    var points = attrs.points;
    var arrow = attrs.arrow;
    var lineWidth = attrs.lineWidth;
    var l;
    var i;

    if (points.length < 2) {
      return;
    }
    context = context || self.get('context');
    context.beginPath();
    context.moveTo(points[0][0], points[0][1]);
    for (i = 1, l = points.length - 1; i < l; i++) {
      context.lineTo(points[i][0], points[i][1]);
    }
    if (arrow) {
      var v = new Vector2(points[l][0] - points[l - 1][0], points[l][1] - points[l - 1][1]);
      var end = Arrow.getEndPoint(v, new Vector2(points[l][0], points[l][1]), lineWidth);
      context.lineTo(end.x, end.y);
      Arrow.makeArrow(context, v, end, lineWidth);
    } else {
      context.lineTo(points[l][0], points[l][1]);
    }
  },
  getPoint: function(t) {
    var attrs = this.__attrs;
    var points = attrs.points;
    var tCache = this.tCache;
    var subt;
    var index;
    if (!tCache) {
      this.__setTcache();
      tCache = this.tCache;
    }
    Util.each(tCache, function(v, i) {
      if (t >= v[0] && t <= v[1]) {
        subt = (t - v[0]) / (v[1] - v[0]);
        index = i;
      }
    });
    return {
      x: LineMath.at(points[index][0], points[index + 1][0], subt),
      y: LineMath.at(points[index][1], points[index + 1][1], subt)
    };
  }
});

module.exports = Polyline;
