/**
 * Created by Elaine on 2018/5/11.
 */
const Util = require('../util/index');

const DEFAULT_PATH = {
  'marker-start': 'M0 2 L6.445174776667712 0 L 6.445174776667712 4',
  'marker-end': 'M 0 0 L 6.445174776667712 2 L 0 4 z',
};

function setDefaultPath (parent, name) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  el.setAttribute('d', DEFAULT_PATH[name]);
  parent.appendChild(el);
  parent.setAttribute('refX', 3.22);
  parent.setAttribute('refY', 2);
  parent.setAttribute('markerWidth', 7);
  parent.setAttribute('markerHeight', 4);
  parent.setAttribute('orient', 'auto');
  return el;
}

function setMarker(cfg, parent, name) {
  const shape = cfg.shape;
  if (!shape) {
    return setDefaultPath(parent, name);
  }
  if (shape.type !== 'marker') {
    throw "the shape of an arrow should be an instance of Marker";
  }
  parent.append(shape.get('el'));
  const r = shape.__attrs.r || shape.__attrs.radius;
  const width = shape.__attrs.x + r;
  const height = shape.__attrs.y + r;
  parent.setAttribute('refX', width * 0.5);
  parent.setAttribute('refY', height * 0.5);
  parent.setAttribute('markerWidth', width);
  parent.setAttribute('markerHeight', height);
  parent.setAttribute('orient', 'auto');
  return shape;
}

const Arrow = function(name, cfg) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
  const id = Util.uniqueId('marker' + '_');
  el.setAttribute('id', id);
  this.__cfg = { el, id };
  this.__cfg[name] = true;
  let child = null;
  if (typeof cfg === 'boolean' && cfg) {
    child = setDefaultPath(el, name);
    this.__cfg.default = true;
  } else if(typeof cfg === 'object') {
    child = setMarker(cfg, el, name);
    this.__cfg.default = false;
  }
  this.__cfg.child = child;
  this.__attrs = { config: cfg };
  return this;
};

Util.augment(Arrow, {
  type: 'arrow',
  match(type, attr) {
    const child = this.__cfg.child.__attrs;
    if(type !== this.type) {
      return false;
    }
    if (!this.__cfg[name]) {
      return false;
    }
    if (typeof attr === 'boolean' && !this.__cfg.default) {
      return false;
    }
    const shape = attr.shape;
    const attrs = shape.__attrs;
    return attrs.symbol === child.symbol &&
        attrs.x === child.x &&
        attrs.y === child.y &&
        attrs.r === child.r;
  },
  update(name, attr) {
    const el = this.__cfg.el;
    if (typeof attr === 'boolean' && attr) {
      el.innerHTML = '';
      el.appendChild()
    }
  },
});

module.exports = Arrow;