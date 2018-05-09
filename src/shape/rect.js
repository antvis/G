const Util = require('../util/index');
const Shape = require('../core/shape');
const Inside = require('./util/inside');

const Rect = function(cfg) {
  Rect.superclass.constructor.call(this, cfg);
};

Rect.ATTRS = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  radius: 0,
  lineWidth: 1,
  fill: 'none'
};

Util.extend(Rect, Shape);

Util.augment(Rect, {
  canFill: true,
  canStroke: true,
  type: 'rect',
  getDefaultAttrs() {
    return {
      lineWidth: 1,
      radius: 0
    };
  },
  __afterSetRadius() {
    const el = this.get('el');
    el.setAttribute('rx', this.__attrs.radius);
    el.setAttribute('ry', this.__attrs.radius);
  },
  __afterSetAttrAll(objs) {
    if ('radius' in objs) {
      const el = this.get('el');
      el.setAttribute('rx', objs.radius);
      el.setAttribute('ry', objs.radius);
    }
  },
  // TODO 图形拾取除了在事件中之外是否有别的用处？
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
    const context = this.get('context');

    if (!context) return false;
    this.createPath();
    return context.isPointInPath(x, y);
  },
  __isPointInStroke(x, y) {
    const self = this;
    const attrs = self.__attrs;
    const rx = attrs.x;
    const ry = attrs.y;
    const width = attrs.width;
    const height = attrs.height;
    const radius = attrs.radius;
    const lineWidth = this.getHitLineWidth();

    if (radius === 0) {
      const halfWidth = lineWidth / 2;
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
  }
});

module.exports = Rect;
