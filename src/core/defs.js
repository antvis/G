/**
 * Defs没有走主流程，而是写成了单例模式
 * 是考虑到通过new G.{shape}构造出的实例
 * 没有add到canvas或group下的时候其实拿不到画布的context
 * 是可以新建一个defs来定义的，但是这样不利于复用，浪费标签了
 * 这部分代码待再组织
 */
const Util = require('../util/index');
const LinearGradient = require('../defs/linearGradient');

const Defs = (function () {
  let _inst = null;
  Defs.prototype.init = function () {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const id = Util.uniqueId('defs_');
    el.setAttribute('id', id);
    this.set('el', el);
    this.set('children', []);
  };
  Defs.prototype.get = function(name) {
    return _inst.__cfg[name];
  };
  Defs.prototype.set = function(name, value) {
    _inst.__cfg[name] = value;
    return _inst;
  };
  Defs.prototype.add = function(items) {
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
  };
  Defs.prototype.addGradient = function(cfg) {
    // todo
  };
  Defs.prototype.find = function(type, attr) {
    const children = this.get('children');
    let result = null;
    for(let i = 0; i < children.length; i++) {
      if (children.match(type, attr)) {
        result = children.get('id');
      }
    }
    return result;
  };
  Defs.prototype.findById = function(id) {
    const children = this.get('children');
    let flag = false;
    Util.each(children, function(child) {
      flag = child.get('id') === id;
    });
    return flag;
  };
  Defs.prototype._setContext = function(item) {
    item.__cfg.parent = this;
    item.__cfg.defs = this;
    item.__cfg.canvas = this.__cfg.canvas;
    item.__cfg.mounted = true;
  };
  function Defs(args) {
    if (_inst == null) {
      _inst = this;
      _inst.__attrs = {};
      _inst.__cfg = {};
    }
    _inst.init(args);
    return _inst;
  }
  return Defs;
})();

module.exports = Defs;