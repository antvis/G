var Util = require('@ali/g-util');
var MatrixUtil = require('./matrix-util');
var DomUtil = require('./dom-util');
var PathUtil = require('@ali/g-path-util');

Util.mix(Util, DomUtil, {
  /**
   * 混合方法 适用CFG模式
   * @param  {Array} arr 数组
   * @return {Array} map后的数组
   */
  mixin: function(c, mixins) {
    var Param = c.CFG ? 'CFG' : 'ATTRS';
    if (c && mixins) {
      c._mixins = mixins;
      c[Param] = c[Param] || {};
      var temp = {};
      Util.each(mixins, function(mixin) {
        Util.augment(c, mixin);
        var attrs = mixin[Param];
        if (attrs) {
          Util.mix(temp, attrs);
        }
      });
      c[Param] = Util.mix(temp, c[Param]);
    }
  },
  // 判断是否为正整数
  isPositiveNum: function(s) {
    var re = /^[0-9]*[1-9][0-9]*$/;
    return re.test(s);
  },
  /**
   * 获取屏幕像素比
   */
  getRatio: function() {
    return window.devicePixelRatio ? window.devicePixelRatio : 2;
  },
  /**
   * 获取宽度
   * @param  {HTMLElement} el  dom节点
   * @return {Number} 宽度
   */
  getWidth: function(el) {
    var width = Util.getStyle(el, 'width');
    if (width === 'auto') {
      width = el.offsetWidth;
    }
    return parseFloat(width);
  },
  /**
   * 获取高度
   * @param  {HTMLElement} el  dom节点
   * @return {Number} 高度
   */
  getHeight: function(el) {
    var height = Util.getStyle(el, 'height');
    if (height === 'auto') {
      height = el.offsetHeight;
    }
    return parseFloat(height);
  },
  /**
   * 获取外层高度
   * @param  {HTMLElement} el  dom节点
   * @return {Number} 高度
   */
  getOuterHeight: function(el) {
    var height = Util.getHeight(el);
    var bTop = parseFloat(Util.getStyle(el, 'borderTopWidth')) || 0;
    var pTop = parseFloat(Util.getStyle(el, 'paddingTop'));
    var pBottom = parseFloat(Util.getStyle(el, 'paddingBottom'));
    var bBottom = parseFloat(Util.getStyle(el, 'borderBottomWidth')) || 0;
    return height + bTop + bBottom + pTop + pBottom;
  },
  parsePathString: PathUtil.toArray,
  path2string: PathUtil.toString,
  path2curve: PathUtil.toCurve,
  pathToAbsolute: PathUtil.toAbsolute,
  catmullRom2bezier: PathUtil.catmullRomToBezier,
  /**
   * 将path数组转换成字符串
   * @param  {Array} array 数组
   * @return {String}  字符串
   */
  parsePathArray: function(array) {
    return Util.path2string(array);
  },
  path2Absolute: function(pathArray) {
    return Util.pathToAbsolute(pathArray);
  }
});

Util.MatrixUtil = MatrixUtil;

module.exports = Util;
