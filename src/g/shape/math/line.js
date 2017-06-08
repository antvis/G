/**
 * @fileOverview 直线算法
 * @author hankaiai@126.com
 * @ignore
 */
const Vector2 = require('@ali/g-matrix').Vector2;

module.exports = {
  at(p1, p2, t) {
    return (p2 - p1) * t + p1;
  },
  pointDistance(x1, y1, x2, y2, x, y) {
    const d = new Vector2(x2 - x1, y2 - y1);
    if (d.isZero()) {
      return NaN;
    }

    const u = d.vertical();
    u.normalize();
    const a = new Vector2(x - x1, y - y1);
    return Math.abs(a.dot(u));
  },
  box(x1, y1, x2, y2, lineWidth) {
    const halfWidth = lineWidth / 2;
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);

    return {
      minX: minX - halfWidth,
      minY: minY - halfWidth,
      maxX: maxX + halfWidth,
      maxY: maxY + halfWidth
    };
  },
  len(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
  }
};
