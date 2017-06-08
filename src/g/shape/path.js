/**
 * @fileOverview Path
 * @author dxq613@gmail.com
 * @author hankaiai@126.com
 * @see http://www.w3.org/TR/2011/REC-SVG11-20110816/paths.html#PathData
 * @ignore
 */
var Util = require('../../util/index');
var Shape = require('../core/shape');
var PathSegment = require('./util/pathSegment');
var Format = require('../format');
var Arrow = require('./util/arrow');
var pathUtil = require('@ali/g-path-util');
var CubicMath = require('./math/cubic');
var Matrix = require('@ali/g-matrix');
var Vector2 = Matrix.Vector2;

var Path = function(cfg) {
  Path.superclass.constructor.call(this, cfg);
};

Path.ATTRS = {
  path: null,
  lineWidth: 1,
  curve: null, // 曲线path
  tCache: null
};

Util.extend(Path, Shape);

Util.augment(Path, {
  canFill: true,
  canStroke: true,
  type: 'path',
  getDefaultAttrs: function() {
    return {
      lineWidth: 1
    };
  },
  __afterSetAttrPath: function(path) {
    var self = this;
    if (Util.isNil(path)) {
      self.setSilent('segments', null);
      self.setSilent('box', undefined);
      return;
    }
    var pathArray = Format.parsePath(path);
    var preSegment;
    var segments = [];

    if (!Util.isArray(pathArray) ||
      pathArray.length === 0 ||
      (pathArray[0][0] !== 'M' &&
        pathArray[0][0] !== 'm')
    ) {
      return;
    }
    var count = pathArray.length;
    for (var i = 0; i < pathArray.length; i++) {
      var item = pathArray[i];
      preSegment = new PathSegment(item, preSegment, i === count - 1);
      segments.push(preSegment);
    }
    self.setSilent('segments', segments);
    self.set('tCache', null);
    this.setSilent('box', null);
  },
  __afterSetAttrAll: function(objs) {
    if (objs.path) {
      this.__afterSetAttrPath(objs.path);
    }
  },
  calculateBox: function() {
    var self = this;
    var attrs = self.__attrs;
    var lineWidth = attrs.lineWidth;
    var lineAppendWidth = attrs.lineAppendWidth || 0;
    var segments = self.get('segments');

    if (!segments) {
      return null;
    }
    lineWidth += lineAppendWidth;
    var minX = Infinity;
    var maxX = -Infinity;
    var minY = Infinity;
    var maxY = -Infinity;
    Util.each(segments, function(segment) {
      segment.getBBox(lineWidth);
      var box = segment.box;
      if (box) {
        if (box.minX < minX) {
          minX = box.minX;
        }

        if (box.maxX > maxX) {
          maxX = box.maxX;
        }

        if (box.minY < minY) {
          minY = box.minY;
        }

        if (box.maxY > maxY) {
          maxY = box.maxY;
        }
      }
    });
    return {
      minX: minX,
      minY: minY,
      maxX: maxX,
      maxY: maxY
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
    if (!context) return undefined;
    self.createPath();
    return context.isPointInPath(x, y);
  },
  __isPointInStroke: function(x, y) {
    var self = this;
    var segments = self.get('segments');
    var attrs = self.__attrs;
    var lineWidth = attrs.lineWidth;
    var appendWidth = attrs.lineAppendWidth || 0;
    lineWidth += appendWidth;
    for (var i = 0, l = segments.length; i < l; i++) {
      if (segments[i].isInside(x, y, lineWidth)) {
        return true;
      }
    }

    return false;
  },
  __setTcache: function() {
    var totalLength = 0;
    var tempLength = 0;
    var tCache = [];
    var segmentT;
    var segmentL;
    var segmentN;
    var l;
    var curve = this.curve;

    if (!curve) {
      return;
    }

    Util.each(curve, function(segment, i) {
      segmentN = curve[i + 1];
      l = segment.length;
      if (segmentN) {
        totalLength += CubicMath.len(segment[l - 2], segment[l - 1], segmentN[1], segmentN[2], segmentN[3], segmentN[4], segmentN[5], segmentN[6]);
      }
    });

    Util.each(curve, function(segment, i) {
      segmentN = curve[i + 1];
      l = segment.length;
      if (segmentN) {
        segmentT = [];
        segmentT[0] = tempLength / totalLength;
        segmentL = CubicMath.len(segment[l - 2], segment[l - 1], segmentN[1], segmentN[2], segmentN[3], segmentN[4], segmentN[5], segmentN[6]);
        tempLength += segmentL;
        segmentT[1] = tempLength / totalLength;
        tCache.push(segmentT);
      }
    });

    this.tCache = tCache;
  },
  __calculateCurve: function() {
    var self = this;
    var attrs = self.__attrs;
    var path = attrs.path;
    this.curve = pathUtil.toCurve(path);
  },
  getPoint: function(t) {
    var tCache = this.tCache;
    var curve;
    var subt;
    var index;
    var seg;
    var l;
    var nextSeg;

    if (!tCache) {
      this.__calculateCurve();
      this.__setTcache();
      tCache = this.tCache;
    }

    curve = this.curve;

    if (!tCache) {
      if (curve) {
        return {
          x: curve[0][1],
          y: curve[0][2]
        };
      }
      return null;
    }
    Util.each(tCache, function(v, i) {
      if (t >= v[0] && t <= v[1]) {
        subt = (t - v[0]) / (v[1] - v[0]);
        index = i;
      }
    });
    seg = curve[index];
    if (Util.isNil(seg) || Util.isNil(index)) {
      return null;
    }
    l = seg.length;
    nextSeg = curve[index + 1];
    return {
      x: CubicMath.at(seg[l - 2], nextSeg[1], nextSeg[3], nextSeg[5], 1 - subt),
      y: CubicMath.at(seg[l - 1], nextSeg[2], nextSeg[4], nextSeg[6], 1 - subt)
    };
  },
  createPath: function(context) {
    var self = this;
    var attrs = self.__attrs;
    var segments = self.get('segments');
    var lineWidth = attrs.lineWidth;
    var arrow = attrs.arrow;

    if (!Util.isArray(segments)) return;
    context = context || self.get('context');
    context.beginPath();
    for (var i = 0, l = segments.length; i < l; i++) {
      if (i === l - 1 && arrow) {
        var lastSeg = segments[i];
        var endTangent = segments[i].endTangent;
        var endPoint = {
          x: lastSeg.params[lastSeg.params.length - 1].x,
          y: lastSeg.params[lastSeg.params.length - 1].y
        };
        if (lastSeg && Util.isFunction(endTangent)) {
          var v = endTangent();
          var end = Arrow.getEndPoint(v, new Vector2(endPoint.x, endPoint.y), lineWidth);
          lastSeg.params[lastSeg.params.length - 1] = end;
          segments[i].draw(context);
          Arrow.makeArrow(context, v, end, lineWidth);
          lastSeg.params[lastSeg.params.length - 1] = endPoint;
        }
      } else {
        segments[i].draw(context);
      }
    }
  }
});

module.exports = Path;
