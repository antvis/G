/**
 * Created by Elaine on 2018/5/10.
 */
const Util = require('../../util/index');

const ATTR_MAP = {
  shadowColor: 'color',
  shadowOpacity: 'opacity',
  shadowBlur: 'blur',
  shadowOffsetX: 'dx',
  shadowOffsetY: 'dy'
};

function parseShadow(config, el) {
  const child = `<feDropShadow 
      dx="${config.dx}" 
      dy="${config.dy}" 
      stdDeviation="${config.blur ? config.blur / 10 : 0}"
      flood-color="${config.color ? config.color : '#000'}"
      flood-opacity="${config.opacity ? config.opacity : 1}"
      />`;
  el.innerHTML = child;
}

const Shadow = function(cfg) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
  const id = Util.uniqueId('filter_');
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
    Util.each(Object.keys(config), attr => {
      if (!flag) {
        flag = config[attr] === cfg[attr];
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

