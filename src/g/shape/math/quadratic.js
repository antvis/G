/**
 * @fileOverview 二次贝赛尔曲线算法
 * @author hankaiai@126.com
 * @ignore
 */
var Vector2 = require('@ali/g-matrix').Vector2;
var Util = require('../../../util/index');

function quadraticAt(p0, p1, p2, t) {
  var onet = 1 - t;
  return onet * (onet * p0 + 2 * t * p1) + t * t * p2;
}

function quadraticProjectPoint(x1, y1, x2, y2, x3, y3, x, y, out) {
  var t;
  var interval = 0.005;
  var d = Infinity;
  var d1;
  var v1;
  var v2;
  var _t;
  var d2;
  var i;
  var EPSILON = 0.0001;
  var v0 = new Vector2(x, y);

  for (_t = 0; _t < 1; _t += 0.05) {
    v1 = new Vector2(
      quadraticAt(x1, x2, x3, _t),
      quadraticAt(y1, y2, y3, _t)
    );

    d1 = v1.distanceToSquared(v0);
    if (d1 < d) {
      t = _t;
      d = d1;
    }
  }
  d = Infinity;

  for (i = 0; i < 32; i++) {
    if (interval < EPSILON) {
      break;
    }

    var prev = t - interval;
    var next = t + interval;

    v1 = new Vector2(
      quadraticAt(x1, x2, x3, prev),
      quadraticAt(y1, y2, y3, prev)
    );

    d1 = v1.distanceToSquared(v0);

    if (prev >= 0 && d1 < d) {
      t = prev;
      d = d1;
    } else {
      v2 = new Vector2(
        quadraticAt(x1, x2, x3, next),
        quadraticAt(y1, y2, y3, next)
      );

      d2 = v2.distanceToSquared(v0);

      if (next <= 1 && d2 < d) {
        t = next;
        d = d2;
      } else {
        interval *= 0.5;
      }
    }
  }

  if (out) {
    out.x = quadraticAt(x1, x2, x3, t);
    out.y = quadraticAt(y1, y2, y3, t);
  }

  return Math.sqrt(d);
}


function quadraticExtrema(p0, p1, p2) {
  var a = p0 + p2 - 2 * p1;
  if (Util.isNumberEqual(a, 0)) {
    return [0.5];
  }
  var rst = (p0 - p1) / a;
  if (rst <= 1 && rst >= 0) {
    return [rst];
  }
  return [];
}

module.exports = {
  at: quadraticAt,
  projectPoint: function(x1, y1, x2, y2, x3, y3, x, y) {
    var rst = {};
    quadraticProjectPoint(x1, y1, x2, y2, x3, y3, x, y, rst);
    return rst;
  },
  pointDistance: quadraticProjectPoint,
  extrema: quadraticExtrema
};
