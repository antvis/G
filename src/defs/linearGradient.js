/**
 * Created by Elaine on 2018/5/9.
 */
const Util = require('../util/index');
const Format = require('../util/format');

const LinearGradient = function(cfg) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    const id = Util.uniqueId('linear' + '_');
    el.setAttribute('id', id);
    Format.parseLineGradient(cfg, el);
    this.__attrs = {
      config: cfg,
      id,
      el
    };
    return this;
};

Util.augment(LinearGradient, {
  type: 'gradient',
  match(type, attr) {
    return this.type === type && this.__attrs.config === attr;
  }
});

module.exports = LinearGradient;