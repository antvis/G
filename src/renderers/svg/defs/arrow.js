/**
 * Created by Elaine on 2018/5/11.
 */
const Util = require('../../../util/index');

const DEFAULT_PATH = {
  'marker-start': 'M6,0 L0,3 L6,6 L3,3Z',
  'marker-end': 'M0,0 L6,3 L0,6 L3,3Z'
};

class Arrow {
  constructor(attrs, type) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    const id = Util.uniqueId('marker_');
    el.setAttribute('id', id);
    this.el = el;
    this.id = id;
    this.cfg = attrs[type === 'marker-start' ? 'startArrow' : 'endArrow'];
    this.stroke = attrs.stroke || '#000';
    if (typeof attrs[type] === true) {
      this._setDefaultPath(type);
    } else {
      this._setMarker(attrs[type]);
    }
    return id;
  }
  match() {
    return false;
  }
  _setDefaultPath(type) {
    const parent = this.el;
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    el.setAttribute('d', DEFAULT_PATH[type]);
    el.setAttribute('stroke', 'none');
    el.setAttribute('fill', this.stroke || '#000');
    this.child = el;
    parent.appendChild(el);
    parent.setAttribute('refX', 3);
    parent.setAttribute('refY', 3);
    parent.setAttribute('markerWidth', 16);
    parent.setAttribute('markerHeight', 16);
    parent.setAttribute('orient', 'auto');
  }
  _setMarker() {
    const parent = this.el;
    const shape = this.cfg;
    const el = shape._cfg.el;
    if (shape.type !== 'marker') {
      throw new TypeError('the shape of an arrow should be an instance of Marker');
    }
    el.setAttribute('stroke', 'none');
    el.setAttribute('fill', this.stroke);
    parent.append(el);
    const width = shape._attrs.x;
    const height = shape._attrs.y;
    parent.setAttribute('refX', width);
    parent.setAttribute('refY', height);
    parent.setAttribute('markerWidth', width * 2);
    parent.setAttribute('markerHeight', height * 2);
    parent.setAttribute('orient', 'auto');
  }
  update(fill) {
    const child = this.child;
    if (child.attr) {
      child.attr('fill', fill);
    } else {
      child.setAttribute('fill', fill);
    }
  }
}

module.exports = Arrow;

