const Util = require('../../util/index');
const Shape = require('../core/shape');

const Fan = function(cfg) {
  Fan.superclass.constructor.call(this, cfg);
};

function getPoint(angle, radius, center) {
  return {
    x: radius * Math.cos(angle) + center.x,
    y: radius * Math.sin(angle) + center.y
  };
}

Fan.ATTRS = {
  x: 0,
  y: 0,
  rs: 0,
  re: 0,
  startAngle: 0,
  endAngle: 0,
  clockwise: false,
  lineWidth: 1
};

Util.extend(Fan, Shape);

Util.augment(Fan, {
  canFill: true,
  canStroke: true,
  type: 'fan',
  getDefaultAttrs() {
    return {
      clockwise: false,
      lineWidth: 1,
      rs: 0,
      re: 0
    };
  },
  __afterSetAttrCx() {
    this.__calculatePath();
  },
  __afterSetAttrCy() {
    this.__calculatePath();
  },
  __afterSetAttrRs() {
    this.__calculatePath();
  },
  __afterSetAttrRe() {
    this.__calculatePath();
  },
  __afterSetAttrStartAngle() {
    this.__calculatePath();
  },
  __afterSetAttrEndAngle() {
    this.__calculatePath();
  },
  __afterSetAttrClockwise() {
    this.__calculatePath();
  },
  __afterSetAttrAll(obj) {
    if ('cx' in obj ||
      'cy' in obj ||
      'rs' in obj ||
      're' in obj ||
      'startAngle' in obj ||
      'endAngle' in obj ||
      'clockwise' in obj
    ) {
      this.__calculatePath();
    }
  },
  __calculatePath() {
    const self = this;
    const attrs = self.__attrs;
    const center = {
      x: attrs.cx,
      y: attrs.cy
    };
    const d = [];
    const startAngle = attrs.startAngle;
    let endAngle = attrs.endAngle;
    if (Util.isNumberEqual((endAngle - startAngle), Math.PI * 2)) {
      endAngle -= 0.00001;
    }
    const outerStart = getPoint(startAngle, attrs.re, center);
    const outerEnd = getPoint(endAngle, attrs.re, center);
    const fa = endAngle > startAngle ? 1 : 0;
    const fs = Math.abs(endAngle - startAngle) > Math.PI ? 1 : 0;
    const rs = attrs.rs;
    const re = attrs.re;
    const innerStart = getPoint(startAngle, attrs.rs, center);
    const innerEnd = getPoint(endAngle, attrs.rs, center);
    if (attrs.rs > 0) {
      d.push(`M ${outerEnd.x},${outerEnd.y}`);
      d.push(`L ${innerEnd.x},${innerEnd.y}`);
      /* if (endAngle - startAngle >= Math.PI) {
        const endPoint = getSymmetricalPoint(innerStart, center);
        d.push(`A ${rs},${rs},0,0,${fa},${endPoint.x},${endPoint.y}`);
        d.push(`M ${endPoint.x},${endPoint.y}`);
      }*/
      d.push(`A ${rs},${rs},0,${fs},${fa === 1 ? 0 : 1},${innerStart.x},${innerStart.y}`);
      d.push(`L ${outerStart.x} ${outerStart.y}`);
    } else {
      d.push(`M ${center.x},${center.y}`);
      d.push(`L ${outerStart.x},${outerStart.y}`);
    }
    /* if (endAngle - startAngle >= Math.PI) {
      const endPoint = getSymmetricalPoint(outerStart, center);
      d.push(`A ${re},${re},0,0,${fa},${endPoint.x},${endPoint.y}`);
    }*/
    d.push(`A ${re},${re},0,${fs},${fa},${outerEnd.x},${outerEnd.y}`);
    if (attrs.rs > 0) {
      d.push(`L ${innerEnd.x},${innerEnd.y}`);
    } else {
      d.push('Z');
    }
    self.get('el').setAttribute('d', d.join(' '));
  },
  createPath(context) {
    const attrs = this.__attrs;
    const cx = attrs.x;
    const cy = attrs.y;
    const rs = attrs.rs;
    const re = attrs.re;
    const startAngle = attrs.startAngle;
    const endAngle = attrs.endAngle;
    const clockwise = attrs.clockwise;

    const ssp = {
      x: Math.cos(startAngle) * rs + cx,
      y: Math.sin(startAngle) * rs + cy
    };
    const sep = {
      x: Math.cos(startAngle) * re + cx,
      y: Math.sin(startAngle) * re + cy
    };
    const esp = {
      x: Math.cos(endAngle) * rs + cx,
      y: Math.sin(endAngle) * rs + cy
    };

    context = context || self.get('context');
    context.beginPath();
    context.moveTo(ssp.x, ssp.y);
    context.lineTo(sep.x, sep.y);
    context.arc(cx, cy, re, startAngle, endAngle, clockwise);
    context.lineTo(esp.x, esp.y);
    context.arc(cx, cy, rs, endAngle, startAngle, !clockwise);
    context.closePath();
  }
});

module.exports = Fan;
