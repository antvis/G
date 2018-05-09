const Util = require('../util/index');
const Shape = require('../core/shape');
const Inside = require('./util/inside');

const Polygon = function(cfg) {
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
  getDefaultAttrs() {
    return {
      lineWidth: 1,
      fill: 'none'
    };
  },
  isPointInPath(x, y) {
    const self = this;
    const fill = self.hasFill();
    const stroke = self.hasStroke();

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
  __isPointInFill(x, y) {
    const self = this;
    const context = self.get('context');
    self.createPath();
    return context.isPointInPath(x, y);
  },
  __isPointInStroke(x, y) {
    const self = this;
    const attrs = self.__attrs;
    const points = attrs.points;
    if (points.length < 2) {
      return false;
    }
    const lineWidth = this.getHitLineWidth();
    const outPoints = points.slice(0);
    if (points.length >= 3) {
      outPoints.push(points[0]);
    }

    return Inside.polyline(outPoints, lineWidth, x, y);
  },
  __afterSetAttrPoints() {
    const value = this.__attrs.points;
    const el = this.get('el');
    let points = value;
    if (!value || value.length === 0) {
      points  = '';
    } else if (Util.isArray(value)) {
      points = points.map(point => point[0] + ',' + point[1]);
      points = points.join(' ');
    }
    el.setAttribute('points', points);
  },
  __afterSetAttrAll(obj) {
    if ('points' in obj) {
      this.__afterSetAttrPoints();
    }
  },
  createPath(context) {}
});

module.exports = Polygon;
