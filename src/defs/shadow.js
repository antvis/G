/**
 * Created by Elaine on 2018/5/10.
 */
const Util = require('../util/index');

const ATTR_MAP = {
  shadowColor: 'color',
  shadowBlur: 'blur',
  shadowOffsetX: 'dx',
  shadowOffsetY: 'dy'
};

function parseShadow(config, el) {
  // todo color貌似不支持
  let child = `<feOffset result="offOut" in="SourceGraphic" dx="${config.dx}" dy="${config.dy}" />`;
  if (!isNaN(Number(config.blur))) {
    child += `<feGaussianBlur result="blurOut" in="offOut" stdDeviation="${config.blur}" />`;
    child += '<feBlend in="SourceGraphic" in2="blurOut" mode="normal" />';
  } else {
    child += '<feBlend in="SourceGraphic" in2="offOut" mode="normal" />';
  }
  el.innerHTML = child;
}

const Shadow = function(cfg) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
  const id = Util.uniqueId('filter' + '_');
  el.setAttribute('id', id);
  parseShadow(cfg, el);
  this.__cfg = { el, id };
  this.__attrs = { config: cfg };
  return this;
};
Util.augment(Shadow, {
  type: 'filter',
  match(type, cfg) {
    if (this.type !== type) {
      return false;
    }
    let flag = false;
    const config = this.__attrs.config;
    Util.each(Object.keys(config), function (attr) {
      if (!flag) {
        config[attr] === cfg[attr];
      }
    });
    return flag;
  },
  update(name, value) {
    const config = this.__attrs.config;
    config[ATTR_MAP[name]] = value;
    parseShadow(config, this.__cfg.el);
    return this;
  }
});

module.exports = Shadow;