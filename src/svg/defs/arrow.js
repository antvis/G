/**
 * Created by Elaine on 2018/5/11.
 */
const Util = require('../../util/index');

function setDefaultPath(parent, name, stroke) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  el.setAttribute('d', 'M0,0 L6,3 L0,6 L3,3Z');
  el.setAttribute('stroke', 'none');
  el.setAttribute('fill', stroke || '#000');
  parent.appendChild(el);
  parent.setAttribute('refX', 3);
  parent.setAttribute('refY', 3);

  return el;
}

function setMarker(shape, parent, name, stroke) {
  if (!shape) {
    return setDefaultPath(parent, name);
  }
  if (shape.type !== 'marker') {
    throw new TypeError('the shape of an arrow should be an instance of Marker');
  }
  shape.attr({ stroke: 'none', fill: stroke });
  parent.append(shape.get('el'));
  const width = shape.__attrs.x;
  const height = shape.__attrs.y;
  parent.setAttribute('refX', width);
  parent.setAttribute('refY', height);
  return shape;
}

const Arrow = function(name, cfg, stroke) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
  const id = Util.uniqueId('marker_');
  el.setAttribute('id', id);
  el.setAttribute('overflow', 'visible');
  el.setAttribute('orient', 'auto-start-reverse');
  this.__cfg = { el, id, stroke: stroke || '#000' };
  this.__cfg[name] = true;
  let child = null;
  if (typeof cfg === 'boolean' && cfg) {
    child = setDefaultPath(el, name, stroke);
    this._setChild(child, true);
  } else if (typeof cfg === 'object') {
    child = setMarker(cfg, el, name, stroke);
    this._setChild(child, false);
  }
  this.__attrs = { config: cfg };
  return this;
};

Util.augment(Arrow, {
  type: 'arrow',
  match(type, attr) {
    if (!this.__cfg[type]) {
      return false;
    }
    if (typeof attr.value === 'object') {
      return false;
    }
    if (attr.stroke !== '#000') {
      return false;
    }
    if (typeof attr.value === 'boolean' && !this.__cfg.default) {
      return false;
    }
    return true;
  },
  _setChild(child, isDefault) {
    this.__cfg.child = child;
    this.__cfg.default = isDefault;
  },
  update(fill) {
    const child = this.__cfg.child;
    this.__cfg.default = false;
    if (child.attr) {
      child.attr('fill', fill);
    } else {
      child.setAttribute('fill', fill);
    }
  }
});

module.exports = Arrow;

