const Util = require('../util/index');
const Shape = require('../core/shape');
const CubicMath = require('./math/cubic');

const Path = function(cfg) {
  Path.superclass.constructor.call(this, cfg);
};

Path.ATTRS = {
  path: null,
  lineWidth: 1,
  curve: null, // 曲线path
  tCache: null,
  startArrow: false,
  endArrow: false
};

Util.extend(Path, Shape);

Util.augment(Path, {
  canFill: true,
  canStroke: true,
  type: 'path',
  getDefaultAttrs() {
    return {
      lineWidth: 1,
      fill: 'none',
      startArrow: false,
      endArrow: false
    };
  },
  __afterSetAttrStroke(value) {
    const start = this.get('marker-start');
    const end = this.get('marker-end');
    if (start) {
      this.get('defs').findById(start).update(null, value);
    }
    if (end) {
      this.get('defs').findById(end).update(null, value);
    }
  },
  __afterSetAttrPath(value) {
    const el = this.get('el');
    let d = value;
    if (Util.isArray(d)) {
      d = d.map(path => {
        return path.join(' ');
      }).join('');
    }
    el.setAttribute('d', d);
  },
  __afterSetAttrAll(objs) {
    if (objs.path) {
      this.__afterSetAttrPath(objs.path);
    }
    if (objs.stroke) {
      this.__afterSetAttrStroke(objs.stroke);
    }
  },
  getPoint(t) {
    let tCache = this.tCache;
    let subt;
    let index;

    if (!tCache) {
      this.__calculateCurve();
      this.__setTcache();
      tCache = this.tCache;
    }

    const curve = this.curve;

    if (!tCache) {
      if (curve) {
        return {
          x: curve[0][1],
          y: curve[0][2]
        };
      }
      return null;
    }
    Util.each(tCache, (v, i) => {
      if (t >= v[0] && t <= v[1]) {
        subt = (t - v[0]) / (v[1] - v[0]);
        index = i;
      }
    });
    const seg = curve[index];
    if (Util.isNil(seg) || Util.isNil(index)) {
      return null;
    }
    const l = seg.length;
    const nextSeg = curve[index + 1];
    return {
      x: CubicMath.at(seg[l - 2], nextSeg[1], nextSeg[3], nextSeg[5], 1 - subt),
      y: CubicMath.at(seg[l - 1], nextSeg[2], nextSeg[4], nextSeg[6], 1 - subt)
    };
  },
  createPath() {}
});

module.exports = Path;
