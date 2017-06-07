import CommonUtil from './common-util';
import DomUtil from './dom-util';
import MatrixUtil from './matrix-util';
import {toArray, toString, toCurve, toAbsolute, catmullRomToBezier} from '@ali/g-path-util';
import {merge} from 'lodash';

const Util = {};

merge(Util, CommonUtil, DomUtil, {
  /**
   * 混合方法 适用CFG模式
   * @param  {Array} arr 数组
   * @return {Array} map后的数组
   */
  mixin(c, mixins) {
    const Param = c.CFG ? 'CFG' : 'ATTRS';
    if (c && mixins) {
      c._mixins = mixins;
      c[Param] = c[Param] || {};
      let temp = {};
      Util.each(mixins, function(mixin) {
        Util.augment(c, mixin);
        const attrs = mixin[Param];
        if (attrs) {
          Util.merge(temp, attrs);
        }
      });
      c[Param] = Util.merge(temp, c[Param]);
    }
  },
  /**
   * 获取屏幕像素比
   */
  getRatio() {
    return window.devicePixelRatio ? window.devicePixelRatio : 2;
  },
  /**
   * 获取宽度
   * @param  {HTMLElement} el  dom节点
   * @return {Number} 宽度
   */
  getWidth(el) {
    let width = Util.getStyle(el, 'width');
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
  getHeight(el) {
    let height = Util.getStyle(el, 'height');
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
  getOuterHeight(el) {
    const height = Util.getHeight(el);
    const bTop = parseFloat(Util.getStyle(el, 'borderTopWidth')) || 0;
    const pTop = parseFloat(Util.getStyle(el, 'paddingTop'));
    const pBottom = parseFloat(Util.getStyle(el, 'paddingBottom'));
    const bBottom = parseFloat(Util.getStyle(el, 'borderBottomWidth')) || 0;
    return height + bTop + bBottom + pTop + pBottom;
  },
  parsePathString: toArray,
  parsePathArray: toString, // Util.path2string
  path2curve: toCurve,
  pathToAbsolute: toAbsolute, // Util.path2Absolute
  catmullRom2bezier: catmullRomToBezier,
  MatrixUtil: MatrixUtil,
});

module.exports = Util;
