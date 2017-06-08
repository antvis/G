import CommonUtil from './common';
import DomUtil from './dom';

const Util = {};

CommonUtil.merge(Util, CommonUtil, DomUtil, {
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
});

module.exports = Util;
