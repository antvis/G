/**
 * Created by Elaine on 2018/5/11.
 */
const Util = require('../../../util/index');

class Arrow {
  constructor(attrs, type) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    const id = Util.uniqueId('marker_');
    el.setAttribute('id', id);
    const shape = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    shape.setAttribute('stroke', 'none');
    shape.setAttribute('fill', attrs.stroke || '#000');
    el.appendChild(shape);
    el.setAttribute('markerWidth', 16);
    el.setAttribute('markerHeight', 16);
    this.el = el;
    this.child = shape;
    this.id = id;
    this.cfg = attrs[type === 'marker-start' ? 'startArrow' : 'endArrow'];
    this.stroke = attrs.stroke || '#000';
    if (this.cfg === true) {
      this._setDefaultPath(type, shape);
    } else {
      this._setMarker(attrs.lineWidth, shape);
    }
    return this;
  }
  match() {
    return false;
  }
  _setDefaultPath(type, el) {
    const parent = this.el;
    el.setAttribute('d', 'M0,0 L6,3 L0,6 L3,3Z');
    parent.setAttribute('refX', 3);
    parent.setAttribute('refY', 3);
    parent.setAttribute('orient', 'auto-start-reverse');
  }
  _setMarker(r, el) {
    const parent = this.el;
    const shape = this.cfg;
    const attrs = shape._attrs;
    if (shape.type !== 'marker') {
      throw new TypeError('the shape of an arrow should be an instance of Marker');
    }
    if (!attrs.x) {
      attrs.x = r;
    }
    if (!attrs.y) {
      attrs.y = r;
    }
    if (!attrs.r && !attrs.radius) {
      attrs.r = r;
    }
    let path = shape._getPath();
    if (Util.isArray(path)) {
      path = path.map(segment => {
        return segment.join(' ');
      }).join('');
    }
    el.setAttribute('d', path);
    parent.appendChild(el);
    parent.setAttribute('refX', attrs.x);
    parent.setAttribute('refY', attrs.y);
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

