const Util = require('../util/index');
const Shape = require('../core/shape');

const Dom = function(cfg) {
  Dom.superclass.constructor.call(this, cfg);
};

Util.extend(Dom, Shape);

Util.augment(Dom, {
  canFill: true,
  canStroke: true,
  type: 'dom',
  __afterSetAttrHtml() {
    const html = this.__attrs.html;
    const el = this.get('el');
    console.log(html);
    if (typeof html === 'string') {
      el.innerHTML = html;
      console.log(el.innerHTML);
    } else {
      el.innerHTML = '';
      el.appendChild(html);
    }
  },
  __afterSetAttrAll(objs) {
    if ('html' in objs) {
      this.__afterSetAttrHtml();
    }
  }
});

module.exports = Dom;
