const Util = require('../../util/index');

module.exports = {
  canFill: false,
  canStroke: false,
  initAttrs(attrs) {
    this._attrs = {
      opacity: 1,
      fillOpacity: 1,
      strokeOpacity: 1
    };
    this.attr(Util.assign(this.getDefaultAttrs(), attrs));
    if (!this._attrs.id) {
      this._attrs.id = Util.uniqueId('g_');
    }
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
      return self._attrs;
    }

    if (Util.isObject(name)) {
      self._attrs = Util.assign(this.getDefaultAttrs(), name);
      if ('fill' in name) {
        self._attrs.fillStyle = name.fill;
      }
      if ('stroke' in name) {
        self._attrs.strokeStyle = name.stroke;
      }
      if ('opacity' in name) {
        self._attrs.globalAlpha = name.opacity;
      }
      self.clearBBox();
      return self;
    }
    if (arguments.length === 2) {
      self._attrs[name] = value;
      if (name === 'fill' || name === 'stroke') {
        self._attrs[name + 'Style'] = value;
      }
      if (name === 'opacity') {
        self._attrs.globalAlpha = value;
      }
      self.clearBBox();
      return self;
    }
    return self._attrs[name];
  },
  clearBBox() {
    this.setSilent('box', null);
  },
  hasFill() {
    return this.canFill && this._attrs.fillStyle;
  },
  hasStroke() {
    return this.canStroke && this._attrs.strokeStyle;
  }
};
