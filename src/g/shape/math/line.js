/**
 * @fileOverview 直线算法
 * @author hankaiai@126.com
 * @ignore
 */
var Vector2 = require('@ali/g-matrix').Vector2;

module.exports = {
  at: function(p1, p2, t) {
    return (p2 - p1) * t + p1;
  },
  pointDistance: function(x1, y1, x2, y2, x, y) {
    var d = new Vector2(x2 - x1, y2 - y1);
    if (d.isZero()) {
      return NaN;
    }

    var u = d.vertical();
    u.normalize();
    var a = new Vector2(x - x1, y - y1);
    return Math.abs(a.dot(u));
  },
  box: function(x1, y1, x2, y2, lineWidth) {
    var halfWidth = lineWidth / 2;
    var minX = Math.min(x1, x2);
    var maxX = Math.max(x1, x2);
    var minY = Math.min(y1, y2);
    var maxY = Math.max(y1, y2);

    return {
      minX: minX - halfWidth,
      minY: minY - halfWidth,
      maxX: maxX + halfWidth,
      maxY: maxY + halfWidth
    };
  },
  len: function(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
  }
};
