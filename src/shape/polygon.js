const Util = require('../util/index');
const Shape = require('../core/shape');

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
