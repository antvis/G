const Util = require('../../util/index');
const Shape = require('../core/shape');

const Dom = function(cfg) {
  Dom.superclass.constructor.call(this, cfg);
};

Util.extend(Dom, Shape);

Util.augment(Dom, {
  canFill: true,
  canStroke: true,
  type: 'dom',
  _afterSetAttrHtml() {
    const html = this.__attrs.html;
    const el = this.get('el');
    if (typeof html === 'string') {
      el.innerHTML = html;
    } else {
      el.innerHTML = '';
      el.appendChild(html);
    }
  },
  _afterSetAttrAll(objs) {
    if ('html' in objs) {
      this._afterSetAttrHtml();
    }
  }
});

module.exports = Dom;
