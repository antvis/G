const Util = require('../../util/index');
const ALIAS_ATTRS = [ 'strokeStyle', 'fillStyle', 'globalAlpha' ];
const CLIP_SHAPES = [ 'circle', 'ellipse', 'fan', 'polygon', 'rect', 'path' ];
const CAPITALIZED_ATTRS_MAP = {
  r: 'R',
  opacity: 'Opacity',
  lineWidth: 'LineWidth',
  clip: 'Clip',
  stroke: 'Stroke',
  fill: 'Fill',
  strokeOpacity: 'Stroke',
  fillOpacity: 'Fill',
  x: 'X',
  y: 'Y',
  rx: 'Rx',
  ry: 'Ry',
  re: 'Re',
  rs: 'Rs',
  width: 'Width',
  height: 'Height',
  img: 'Img',
  x1: 'X1',
  x2: 'X2',
  y1: 'Y1',
  y2: 'Y2',
  points: 'Points',
  p1: 'P1',
  p2: 'P2',
  p3: 'P3',
  p4: 'P4',
  text: 'Text',
  radius: 'Radius',
  textAlign: 'TextAlign',
  textBaseline: 'TextBaseline',
  font: 'Font',
  fontSize: 'FontSize',
  fontStyle: 'FontStyle',
  fontVariant: 'FontVariant',
  fontWeight: 'FontWeight',
  fontFamily: 'FontFamily',
  clockwise: 'Clockwise',
  startAngle: 'StartAngle',
  endAngle: 'EndAngle',
  path: 'Path'
};
const SVG_ATTR_MAP = {
  opacity: 'opacity',
  clip: 'clip',
  stroke: 'stroke',
  fill: 'fill',
  strokeOpacity: 'stroke-opacity',
  fillOpacity: 'fill-opacity',
  strokeOpacity: 'Stroke',
  fillOpacity: 'Fill',
  x: 'x',
  y: 'y',
  r: 'r',
  rx: 'rx',
  ry: 'ry',
  re: 're',
  rs: 'rs',
  width: 'width',
  height: 'height',
  image: 'href',
  x1: 'x1',
  x2: 'x2',
  y1: 'y1',
  y2: 'y2',
  lineCap: 'stroke-linecap',
  lineJoin: 'stroke-linejoin',
  lineWidth: 'stroke-width',
  lineDash: 'stroke-dasharray',
  miterLimit: 'stroke-miterlimit',
  font: 'font',
  fontSize: 'font-size',
  fontStyle: 'font-style',
  fontVariant: 'font-variant',
  fontWeight: 'font-weight',
  fontFamily: 'font-family',
  preserveAspectRatio: 'preserveAspectRatio'
};
const ALIAS_ATTRS_MAP = {
  stroke: 'strokeStyle',
  fill: 'fillStyle',
  opacity: 'globalAlpha'
};
const SHADOW_ATTR = ['shadowColor', 'shadowBlur', 'shadowOffsetX', 'shadowOffsetY'];

module.exports = {
  canFill: false,
  canStroke: false,
  initAttrs(attrs) {
    this.__attrs = {
      opacity: 1,
      fillOpacity: 1,
      strokeOpacity: 1
    };
    this.attr(Util.assign(this.getDefaultAttrs(), attrs));
    return this;
  },
  getDefaultAttrs() {
    return {};
  },
  /**
   * 设置或者设置属性，有以下 4 种情形：
   *   - name 不存在, 则返回属性集合
   *   - name 为字符串，value 为空，获取属性值
   *   - name 为字符串，value 不为空，设置属性值，返回 this
   *   - name 为键值对，value 为空，设置属性值
   *
   * @param  {String | Object} name  属性名
   * @param  {*} value 属性值
   * @return {*} 属性值
   */
  attr(name, value) {
    const self = this;
    if (arguments.length === 0) {
      return self.__attrs;
    }
    if (Util.isObject(name)) {
      for (const k in name) {
        if (ALIAS_ATTRS.indexOf(k) === -1) {
          const v = name[k];
          self._setAttr(k, v);
        }
      }
      if (self.__afterSetAttrAll) {
        self.__afterSetAttrAll(name);
      }
      // self.setSilent('box', null);
      self.clearBBox();
      return self;
    }
    if (arguments.length === 2) {
      self._setAttr(name, value);
      const m = '__afterSetAttr' + CAPITALIZED_ATTRS_MAP[name];
      if (CAPITALIZED_ATTRS_MAP[name] && self[m]) {
        self[m](value);
      }
      self.clearBBox();
      return self;
    }
    return self._getAttr(name);
  },
  clearBBox() {
    this.setSilent('box', null);
  },
  __afterSetAttrAll() {

  },
  // 属性获取触发函数
  _getAttr(name) {
    return this.__attrs[name];
  },
  // 属性设置触发函数
  _setAttr(name, value) {
    const self = this;
    const el = self.get('el');
    // TODO clip & transform & shadow blah blah..
    if (name === 'clip') {
      self.__setAttrClip(value);
      self.__attrs.clip = value;
    } else if (name === 'transform') {
      self.__setAttrTrans(value);
    } else if(name.startsWith('shadow')) {
      self.__setAttrShadow(name, value);
    } else if (~['stroke', 'strokeStyle', 'fill', 'fillStyle'].indexOf(name) && /^[r,R,L,l]{1}[\s]+\(/.test(value.trim())) {
      self.__setAttrGradients(name, value.trim());
    } else {
      // 先存好属性，然后对一些svg和canvas中不同的属性进行特判
      self.__attrs[name] = value;
      if (['circle', 'ellipse', 'marker'].indexOf(self.type) >= 0 && ['x', 'y'].indexOf(name) >= 0) {
        /**
         * 本来考虑想写到对应图形里面的，但是x,y又是svg通用属性，这样会同时存在x，y, cx,cy
         * 如果在下面svgAttr设置的时候还是要特判，不如就在这边特殊处理一下吧
         */
        if (self.type !== 'marker') {
          el.setAttribute('c' + name, value);
        }
      } else {
        let svgAttr = SVG_ATTR_MAP[name];
        if (el && svgAttr) {
          el.setAttribute(svgAttr, value);
        }
        const alias = ALIAS_ATTRS_MAP[name];
        if (alias) {
          svgAttr = SVG_ATTR_MAP[alias];
          if (el && svgAttr) {
            el.setAttribute(svgAttr, value);
          }
          self.__attrs[alias] = value;
        }
      }
    }
    return self;
  },
  hasFill() {
    return this.canFill && this.__attrs.fillStyle;
  },
  hasStroke() {
    return this.canStroke && this.__attrs.strokeStyle;
  },
  __setAttrShadow(name, value) {
    const attrs = this.__attrs;
    attrs[name] = value;
    let filter = this.get('filter');
    const defs = this.get('defs');
    if (filter) {
      defs.findById(filter).update(name, value);
      return;
    }
    if (!defs) {
      this.__setAttrDependency(name, value);
      return;
    }
    const cfg  = {
      dx: this.__attrs.shadowOffsetX,
      dy: this.__attrs.shadowOffsetY,
      blur: this.__attrs.shadowBlur,
      color: this.__attrs.shadowColor
    };
    if (isNaN(Number(cfg.dx)) || isNaN(Number(cfg.dy))) {
      return;
    }
    let id = defs.find('filter', cfg);
    if (!id) {
      id = defs.addShadow(cfg, this);
    }
    this.__cfg.filter = id;
    this.get('el').setAttribute('filter', `url(#${id})`);
  },
  __setAttrGradients(name, value) {
    this.__attrs[name] = value;
    name = name.replace('Style', '');
    const defs = this.get('defs');
    if (!defs) {
      this.__setAttrDependency(name, value);
      return;
    }
    let id = defs.find('gradient', value);
    if (!id) {
      id = defs.addGradient(value, this);
    }
    this.get('el').setAttribute(name, `url(#${id})`);
  },
  __setAttrDependency(name, value) {
    let dependencies = this.get('dependencies');
    if (!dependencies) {
      dependencies = {};
    }
    dependencies[name] = value;
    this.__cfg.dependencies = dependencies;
  },
  // 设置透明度
  __setAttrOpacity(v) {
    this.__attrs.globalAlpha = v;
    this.get('el').setAttribute('opacity', v);
    return v;
  },
  __setAttrClip(clip) {
    const self = this;
    if (clip && (CLIP_SHAPES.indexOf(clip.type) > -1)) {
      if (clip.get('canvas') === null) {
        clip = Util.clone(clip);
      }
      clip.set('parent', self.get('parent'));
      clip.set('context', self.get('context'));
      clip.inside = function(x, y) {
        const v = [ x, y, 1 ];
        clip.invert(v, self.get('canvas')); // 已经在外面转换
        return clip.__isPointInFill(v[0], v[1]);
      };
      return clip;
    }
    return null;
  },
  __setAttrTrans(value) {
    return this.transform(value);
  }
};
