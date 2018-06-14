const Util = require('../../util/index');
const Shape = require('../core/shape');

const Path = function(cfg) {
  Path.superclass.constructor.call(this, cfg);
};

function at(p0, p1, p2, p3, t) {
  const onet = 1 - t;
  return onet * onet * (onet * p3 + 3 * t * p2) + t * t * (t * p0 + 3 * onet * p1);
}

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
  _afterSetAttrStroke(value) {
    const start = this.get('marker-start');
    const end = this.get('marker-end');
    if (start) {
      this.get('defs').findById(start).update(null, value);
    }
    if (end) {
      this.get('defs').findById(end).update(null, value);
    }
  },
  _afterSetAttrPath(value) {
    const el = this.get('el');
    let d = value;
    if (Util.isArray(d)) {
      d = d.map(path => {
        return path.join(' ');
      }).join('');
    }
    if (~d.indexOf('NaN')) {
      el.setAttribute('d', '');
    } else {
      el.setAttribute('d', d);
    }
  },
  _afterSetAttrAll(objs) {
    if (objs.path) {
      this._afterSetAttrPath(objs.path);
    }
    if (objs.stroke) {
      this._afterSetAttrStroke(objs.stroke);
    }
  },
  getPoint(t) {
    let tCache = this.tCache;
    let subt;
    let index;

    if (!tCache) {
      this._calculateCurve();
      this._setTcache();
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
      x: at(seg[l - 2], nextSeg[1], nextSeg[3], nextSeg[5], 1 - subt),
      y: at(seg[l - 1], nextSeg[2], nextSeg[4], nextSeg[6], 1 - subt)
    };
  },
  createPath() {}
});

module.exports = Path;
