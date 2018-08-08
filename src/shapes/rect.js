const Util = require('../util/index');
const Shape = require('../core/shape');

const Rect = function(cfg) {
  Rect.superclass.constructor.call(this, cfg);
};

Rect.ATTRS = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  radius: 0,
  lineWidth: 1
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
  calculateBox() {
    const self = this;
    const attrs = self._attrs;
    const x = attrs.x;
    const y = attrs.y;
    const width = attrs.width;
    const height = attrs.height;
    const lineWidth = this.getHitLineWidth();

    const halfWidth = lineWidth / 2;
    return {
      minX: x - halfWidth,
      minY: y - halfWidth,
      maxX: x + width + halfWidth,
      maxY: y + height + halfWidth
    };
  },
  createPath(context) {
    const self = this;
    const attrs = self._attrs;
    const x = attrs.x;
    const y = attrs.y;
    const width = attrs.width;
    const height = attrs.height;
    const radius = attrs.radius;
    let r1,
      r2,
      r3,
      r4;
    context = context || self.get('context');

    context.beginPath();
    if (radius === 0) {
      // 改成原生的rect方法
      context.rect(x, y, width, height);
    } else {
      if (Util.isArray(radius)) {
        if (radius.length === 1) {
          r1 = r2 = r3 = r4 = radius[0];
        } else if (radius.length === 2) {
          r1 = r3 = radius[0];
          r2 = r4 = radius[1];
        } else if (radius.length === 3) {
          r1 = radius[0];
          r2 = r4 = radius[1];
          r3 = radius[2];
        } else {
          r1 = radius[0];
          r2 = radius[1];
          r3 = radius[2];
          r4 = radius[3];
        }
      } else {
        r1 = r2 = r3 = r4 = radius;
      }
      context.moveTo(x + r1, y);
      context.lineTo(x + width - r2, y);
      r2 !== 0 && context.arc(x + width - r2, y + r2, r2, -Math.PI / 2, 0);
      context.lineTo(x + width, y + height - r3);
      r3 !== 0 && context.arc(x + width - r3, y + height - r3, r3, 0, Math.PI / 2);
      context.lineTo(x + r4, y + height);
      r4 !== 0 && context.arc(x + r4, y + height - r4, r4, Math.PI / 2, Math.PI);
      context.lineTo(x, y + r1);
      r1 !== 0 && context.arc(x + r1, y + r1, r1, Math.PI, Math.PI * 1.5);
      context.closePath();
    }
  }
});

module.exports = Rect;
