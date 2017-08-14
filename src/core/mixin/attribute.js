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
const ALIAS_ATTRS_MAP = {
  stroke: 'strokeStyle',
  fill: 'fillStyle',
  opacity: 'globalAlpha'
};

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
      if (self._setAttr(name, value) !== false) {
        const m = '__afterSetAttr' + CAPITALIZED_ATTRS_MAP[name];
        if (self[m]) {
          self[m](value);
        }
      }
      // self.setSilent('box', null);
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
    if (name === 'clip') {
      self.__setAttrClip(value);
      self.__attrs.clip = value;
    } else if (name === 'transform') {
      self.__setAttrTrans(value);
    } else {
      self.__attrs[name] = value;
      const alias = ALIAS_ATTRS_MAP[name];
      if (alias) {
        self.__attrs[alias] = value;
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
  // 设置透明度
  __setAttrOpacity(v) {
    this.__attrs.globalAlpha = v;
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
