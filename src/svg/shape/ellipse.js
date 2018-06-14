const Util = require('../../util/index');
const Shape = require('../core/shape');

const Ellipse = function(cfg) {
  Ellipse.superclass.constructor.call(this, cfg);
};

Ellipse.ATTRS = {
  x: 0,
  y: 0,
  rx: 1,
  ry: 1,
  lineWidth: 1
};

Util.extend(Ellipse, Shape);

Util.augment(Ellipse, {
  canFill: true,
  canStroke: true,
  type: 'ellipse',
  getDefaultAttrs() {
    return {
      lineWidth: 1
    };
  }
});

module.exports = Ellipse;
