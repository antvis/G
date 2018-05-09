/**
 * Created by Elaine on 2018/5/8.
 */
const Util = require('../util/index');
const Element = require('./element');

const Defs = function(cfg) {
  Defs.superclass.constructor.call(this,cfg);
  this.set('children', []);
}

Util.extend(Defs, Element);

Util.augment(Defs, {
  isGroup: false,
  canFill: false,
  canStroke: false,
  getDefaultCfg() {
    return {
      capture: false,
      visible: false
    };
  },
  add(items) {
    const el = this.get('el');
    const self = this;
    const children = this.get('children');
    if (Util.isArray(items)) {
      Util.each(items, function(item) {
        const parent = item.get('parent');
        if (parent) {
          parent.removeChild(item, false);
          self._setContext(item);
        }
        el.appendChild(item.get('el'));
      });
      children.push.apply(children, items);
      return self;
    }
    if (self.findById(items.get('id'))) {
      return self;
    }
    const parent = items.get('parent');
    if (parent) {
      parent.removeChild(items, false);
    }
    self._setContext(items);
    el.appendChild(items.get('el'));
    return self;
  },
  find(type, attr) {
    const children = this.get('children');
    let result = null;
    for(let i = 0; i < children.length; i++) {
      if (children.match(type, attr)) {
        result = children.get('id');
      }
    }
    return result;
  },
  findById(id) {
    const children = this.get('children');
    let flag = false;
    Util.each(children, function(child) {
      flag = child.get('id') === id;
    });
    return flag;
  },
  _setContext(item) {
    item.__cfg.parent = this;
    item.__cfg.defs = this;
    item.__cfg.canvas = this.__cfg.canvas;
    item.__cfg.mounted = true;
  },
});

module.exports = Defs;