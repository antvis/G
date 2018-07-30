/**
 * Created by Elaine on 2018/5/14.
 */
const Util = require('../../../util/index');

class Clip {
  constructor(cfg) {
    this.type = 'clip';
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
    this.el = el;
    this.id = Util.uniqueId('clip_');
    el.id = this.id;
    el.appendChild(cfg._cfg.el);
    this.cfg = cfg;
    return this;
  }
  match() {
    return false;
  }
  remove() {
    const el = this.el;
    el.parentNode.removeChild(el);
  }
}

module.exports = Clip;
