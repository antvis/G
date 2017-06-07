/**
 * @fileOverview 圆弧线算法
 * @author hankaiai@126.com
 * @ignore
 */
var Vector2 = require('@ali/g-matrix').Vector2;
var GMath = require('@ali/g-math');
var Util = require('../../../util/index');

function circlePoint(cx, cy, r, angle) {
  return {
    x: Math.cos(angle) * r + cx,
    y: Math.sin(angle) * r + cy
  };
}

function angleNearTo(angle, min, max, out) {
  var v1;
  var v2;
  if (out) {
    if (angle < min) {
      v1 = min - angle;
      v2 = Math.PI * 2 - max + angle;
    } else if (angle > max) {
      v1 = Math.PI * 2 - angle + min;
      v2 = angle - max;
    }
  } else {
    v1 = angle - min;
    v2 = max - angle;
  }

  return v1 > v2 ? max : min;
}

function nearAngle(angle, startAngle, endAngle, clockwise) {
  var plus = 0;
  if (endAngle - startAngle >= Math.PI * 2) {
    plus = Math.PI * 2;
  }
  startAngle = GMath.mod(startAngle, Math.PI * 2);
  endAngle = GMath.mod(endAngle, Math.PI * 2) + plus;
  angle = GMath.mod(angle, Math.PI * 2);
  if (clockwise) {
    if (startAngle >= endAngle) {
      if (angle > endAngle && angle < startAngle) {
        return angle;
      }
      return angleNearTo(angle, endAngle, startAngle, true);
    }
    if (angle < startAngle || angle > endAngle) {
      return angle;
    }
    return angleNearTo(angle, startAngle, endAngle);
  }
  if (startAngle <= endAngle) {
    if (startAngle < angle && angle < endAngle) {
      return angle;
    }
    return angleNearTo(angle, startAngle, endAngle, true);
  }
  if (angle > startAngle || angle < endAngle) {
    return angle;
  }
  return angleNearTo(angle, endAngle, startAngle);
}

function arcProjectPoint(cx, cy, r, startAngle, endAngle, clockwise, x, y, out) {
  var v = new Vector2(x, y);
  var v0 = new Vector2(cx, cy);
  var v1 = new Vector2(1, 0);
  var subv = Vector2.sub(v, v0);
  var angle = v1.angleTo(subv);

  angle = nearAngle(angle, startAngle, endAngle, clockwise);
  var vpoint = new Vector2(r * Math.cos(angle) + cx, r * Math.sin(angle) + cy);
  if (out) {
    out.x = vpoint.x;
    out.y = vpoint.y;
  }
  var d = v.distanceTo(vpoint);
  return d;
}

function arcBox(cx, cy, r, startAngle, endAngle, clockwise) {
  var angleRight = 0;
  var angleBottom = Math.PI / 2;
  var angleLeft = Math.PI;
  var angleTop = Math.PI * 3 / 2;
  var points = [];
  var angle = nearAngle(angleRight, startAngle, endAngle, clockwise);
  if (angle === angleRight) {
    points.push(circlePoint(cx, cy, r, angleRight));
  }

  angle = nearAngle(angleBottom, startAngle, endAngle, clockwise);
  if (angle === angleBottom) {
    points.push(circlePoint(cx, cy, r, angleBottom));
  }

  angle = nearAngle(angleLeft, startAngle, endAngle, clockwise);
  if (angle === angleLeft) {
    points.push(circlePoint(cx, cy, r, angleLeft));
  }

  angle = nearAngle(angleTop, startAngle, endAngle, clockwise);
  if (angle === angleTop) {
    points.push(circlePoint(cx, cy, r, angleTop));
  }

  points.push(circlePoint(cx, cy, r, startAngle));
  points.push(circlePoint(cx, cy, r, endAngle));
  var minX = Infinity;
  var maxX = -Infinity;
  var minY = Infinity;
  var maxY = -Infinity;
  Util.each(points, function(point) {
    if (minX > point.x) {
      minX = point.x;
    }
    if (maxX < point.x) {
      maxX = point.x;
    }
    if (minY > point.y) {
      minY = point.y;
    }
    if (maxY < point.y) {
      maxY = point.y;
    }
  });

  return {
    minX: minX,
    minY: minY,
    maxX: maxX,
    maxY: maxY
  };
}

module.exports = {
  nearAngle: nearAngle,
  projectPoint: function(cx, cy, r, startAngle, endAngle, clockwise, x, y) {
    var rst = {};
    arcProjectPoint(cx, cy, r, startAngle, endAngle, clockwise, x, y, rst);
    return rst;
  },
  pointDistance: arcProjectPoint,
  box: arcBox
};
