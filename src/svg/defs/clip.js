/**
 * Created by Elaine on 2018/5/14.
 */
const Util = require('../../util/index');

const Clip = function(cfg) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
  const id = Util.uniqueId('clip_');
  if (cfg.get('el')) {
    el.appendChild(cfg.get('el'));
  } else if (Util.isString(cfg.nodeName)) {
    el.appendChild(cfg);
  } else {
    throw 'clip element should be a instance of Shape or a SVG node';
  }
  el.setAttribute('id', id);
  this.__cfg = { el, id };
  this.__attrs = { config: cfg };
  return this;
};

Util.augment(Clip, {
  type: 'clip',
  match() {
    return false;
  }
});

module.exports = Clip;

