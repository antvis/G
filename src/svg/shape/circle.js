const Util = require('../../util/index');
const Shape = require('../core/shape');

const Circle = function(cfg) {
  Circle.superclass.constructor.call(this, cfg);
};

Circle.ATTRS = {
  x: 0,
  y: 0,
  r: 0,
  lineWidth: 1
};

Util.extend(Circle, Shape);

Util.augment(Circle, {
  canFill: true,
  canStroke: true,
  type: 'circle',
  getDefaultAttrs() {
    return {
      lineWidth: 1,
      fill: 'none'
    };
  }
});

module.exports = Circle;
