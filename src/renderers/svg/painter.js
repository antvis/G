const Util = require('../../util');
const Marker = require('../../shapes/marker');
const Defs = require('./defs');

const SHAPE_TO_TAGS = {
  rect: 'rect',
  circle: 'circle',
  line: 'line',
  path: 'path',
  marker: 'path',
  text: 'text',
  polygon: 'polygon',
  image: 'image',
  ellipse: 'ellipse',
  dom: 'foreignObject',
  fan: 'path',
  group: 'g'
};

const SVG_ATTR_MAP = {
  opacity: 'opacity',
  stroke: 'stroke-width',
  fill: 'fill',
  strokeOpacity: 'stroke-opacity',
  fillOpacity: 'fill-opacity',
  strokeStyle: 'stroke-width',
  fillStyle: 'fill',
  x: 'x',
  y: 'y',
  r: 'r',
  rx: 'rx',
  ry: 'ry',
  re: 're',
  rs: 'rs',
  width: 'width',
  height: 'height',
  image: 'href',
  x1: 'x1',
  x2: 'x2',
  y1: 'y1',
  y2: 'y2',
  lineCap: 'stroke-linecap',
  lineJoin: 'stroke-linejoin',
  lineWidth: 'stroke-width',
  lineDash: 'stroke-dasharray',
  miterLimit: 'stroke-miterlimit',
  font: 'font',
  fontSize: 'font-size',
  fontStyle: 'font-style',
  fontVariant: 'font-variant',
  fontWeight: 'font-weight',
  fontFamily: 'font-family',
  startArrow: 'marker-start',
  endArrow: 'marker-end',
  path: 'd',
  class: 'class',
  style: 'style',
  preserveAspectRatio: 'preserveAspectRatio'
};

const BASELINE_MAP = {
  top: 'before-edge',
  middle: 'central',
  bottom: 'after-edge',
  alphabetic: 'baseline',
  hanging: 'hanging'
};

const ANCHOR_MAP = {
  left: 'left',
  start: 'left',
  center: 'middle',
  right: 'end',
  end: 'end'
};

class Painter {
  constructor(dom) {
    if (!dom) {
      return null;
    }
    const svgId = Util.uniqueId('canvas_');
    const canvasDom = Util.createDom(`<svg id="${svgId}" width=></svg>`);
    dom.appendChild(canvasDom);
    this.type = 'svg';
    this.canvas = canvasDom;
    this.context = new Defs(canvasDom);
    this.toDraw = false;
    return this;
  }
  draw(model) {
    this._drawGroup(model);
  }
  _drawGroup(model) {
    const self = this;
    const cfg = model._cfg;
    const children = cfg.children;
    let shape;

    this._drawShape(model);

    for (let i = 0; i < children.length; i++) {
      shape = children[i];
      if (shape.isGroup) {
        self._drawGroup(shape);
      } else {
        self._drawShape(shape);
      }
    }
  }
  _drawShape(model) {
    const self = this;
    const cfg = model._cfg;

    // 删除
    if (cfg.removed || cfg.destroyed) {
      self._removeShape(model);
      return;
    }

    // 新增节点
    if (!cfg.el && cfg.parent) {
      self._createDom(model);
      self._updateShape(model);
    }

    // 更新
    if (model._attrs.hasUpdate) {
      self._updateShape(model);
    }
  }
  _updateShape(model) {
    const self = this;
    const attrs = model._attrs;
    const formerAttrs = model._cfg.attrs;
    if (!model._cfg.el) {
      self._createDom(model);
    }
    if (model.type === 'text') {
      self._updateText(model);
      return;
    }
    // todo 阴影涉及好多个属性，在外面处理。怎么判断是个问题。。
    for (const key in attrs) {
      if (attrs[key] !== formerAttrs[key]) {
        self._setAttribute(model, key, attrs[key]);
      }
    }
    model._cfg.attrs = model._attrs;
    model._attrs.hasUpdate = false;
  }
  _removeShape(model) {
    const el = model._cfg.el;
    if (el) {
      model._cfg.parent.get('el').removeChild(el);
    }
  }
  _setAttribute(model, name, value) {
    const type = model.type;
    const attrs = model._attrs;
    const el = model._cfg.el;
    const defs = this.context;

    // 计算marker路径
    if (type === 'marker' && ~[ 'x', 'y', 'radius', 'r' ].indexOf(name) && attrs.hasUpdate) {
      el.setAttribute('d', this._assembleMarker(attrs));
      // 避免多次计算shape
      attrs.hasUpdate = false;
      return;
    }
    // 圆和椭圆不是x, y， 是cx, cy。 marker的x,y 用于计算marker的路径，不需要写到dom
    if (~[ 'circle', 'ellipse' ].indexOf(type) && ~[ 'x', 'y' ].indexOf(name)) {
      el.setAttribute('c' + name, parseInt(value, 10));
      return;
    }
    // 圆角矩形
    if (type === 'react' && name === 'r') {
      el.setAttribute('rx', value);
      el.setAttribute('ry', value);
      return;
    }
    // 多边形
    if (type === 'polygon' && name === 'points') {
      if (!value || value.length === 0) {
        value = '';
      }
      if (Util.isArray(value)) {
        value = value.map(point => point[0] + ',' + point[1]);
        value = value.join(' ');
      }
      el.setAttribute('points', value);
    }
    // 设置path
    if (name === 'path' && Util.isArray(value)) {
      el.setAttribute('d', this._formatPath(value));
      return;
    }
    // 设置图片
    if (name === 'image') {
      this._setImage(model, value);
      return;
    }
    if (name === 'transform') {
      if (!value) {
        el.removeAttribute('transform');
        return;
      }
      model.transform(value);
      this._setTransform(model);
      return;
    }
    if (name === 'rotate') {
      if (!value) {
        el.removeAttribute('transform');
        return;
      }
      model.rotateAtStart(value);
      this._setTransform(model);
      return;
    }
    if (name === 'matrix') {
      this._setTransform(model);
      return;
    }
    if (name === 'fill' || name === 'stroke') {
      if (!value) {
        el.removeAttribute(SVG_ATTR_MAP[name]);
        return;
      }
      if (/^[r,R,L,l]{1}[\s]*\(/.test(value.trim())) {
        let id = defs.find('gradient', value);
        if (!id) {
          id = defs.addGradient(value, this);
        }
        el.setAttribute('gradient', `url(#${id})`);
      } else {
        el.setAttribute(SVG_ATTR_MAP[name], value);
      }
      return;
    }
    if (name === 'clip') {
      this._setClip(model, value);
      return;
    }
    if (~name.indexOf('Arrow')) {
      name = SVG_ATTR_MAP[name];
      if (!value) {
        model._cfg[name] = null;
        el.removeAttribute(name);
      } else {
        let id = null;
        if (typeof value === 'boolean') {
          id = defs.getDefaultArrow(attrs, name);
        } else {
          this._createDom(value);
          this._updateShape(value);
          id = defs.addArrow(attrs, name);
        }
        el.setAttribute(name, `url(#${id})`);
        model._cfg[name] = id;
      }
      return;
    }

    // foreignObject
    if (name === 'html') {
      if (typeof value === 'string') {
        el.innerHTML = value;
      } else {
        el.innerHTML = '';
        el.appendChild(value);
      }
    }
  }
  _createDom(model) {
    const type = SHAPE_TO_TAGS[model.type];
    if (!type) {
      throw new Error('the type' + model.type + 'is not supported by svg');
    }
    const shape = document.createElementNS('http://www.w3.org/2000/svg', type);
    const id = model._attrs.id || Util.uniqueId(this.type + '_');
    shape.id = id;
    model._cfg.el = shape;
    model._cfg.parent.get('el').appendChild(shape);
    model._cfg.attrs = {};
    return shape;
  }
  _assembleMarker(attrs) {
    let r = attrs.r;
    if (typeof attrs.r === 'undefined') {
      r = attrs.radius;
    }
    if (isNaN(Number(attrs.x)) || isNaN(Number(attrs.y)) || isNaN(Number(r))) {
      return '';
    }
    let d = '';
    if (typeof attrs.symbol === 'function') {
      d = attrs.symbol(attrs.x, attrs.y, r);
    } else {
      d = Marker.Symbols[attrs.symbol || 'circle'](attrs.x, attrs.y, r);
    }
    if (Util.isArray(d)) {
      d = d.map(path => {
        return path.join(' ');
      }).join('');
    }
    return d;
  }
  _formatPath(value) {
    value = value.map(path => {
      return path.join(' ');
    }).join('');
    if (~value.indexOf('NaN')) {
      return '';
    }
    return value;
  }
  _setTransform(model) {
    const matrix = model._attrs.matrix;
    const el = model._cfg.el;
    const transform = [];
    for (let i = 0; i < 9; i += 3) {
      transform.push(matrix[i] + ',' + matrix[i + 1]);
    }
    el.setAttribute('transform', `matrix(${transform.join(',')})`);
  }
  _setImage(model, img) {
    const attrs = model._attrs;
    const el = model._cfg.el;
    if (Util.isString(img)) {
      el.setAttribute('href', img);
    } else if (img instanceof Image) {
      if (!attrs.width) {
        self.attr('width', img.width);
      }
      if (!attrs.height) {
        self.attr('height', img.height);
      }
      el.setAttribute('href', img.src);
    } else if (img instanceof HTMLElement && Util.isString(img.nodeName) && img.nodeName.toUpperCase() === 'CANVAS') {
      el.setAttribute('href', img.toDataURL());
    } else if (img instanceof ImageData) {
      const canvas = document.createElement('canvas');
      canvas.setAttribute('width', img.width);
      canvas.setAttribute('height', img.height);
      canvas.getContext('2d').putImageData(img, 0, 0);
      if (!attrs.width) {
        self.attr('width', img.width);
      }
      if (!attrs.height) {
        self.attr('height', img.height);
      }
      el.setAttribute('href', canvas.toDataURL());
    }
  }
  _updateText(model) {
    const self = this;
    const attrs = model._attrs;
    const formerAttrs = model._cfg.attrs;
    const el = model._cfg.el;

    for (const attr in attrs) {
      if (attrs[attr] !== formerAttrs[attr]) {
        if (attr === 'text') {
          self._setText(attrs[attr]);
          continue;
        }
        if (attr === 'textBaseline') {
          el.setAttribute('alignment-baseline', BASELINE_MAP[attr]);
          continue;
        }
        if (attr === 'textAlign') {
          el.setAttribute('text-anchor', ANCHOR_MAP[attr]);
          continue;
        }
        if (attr === 'outline') {
          el.setAttribute('paint-order', 'stroke');
          el.setAttribute('style', 'stroke-linecap:butt; stroke-linejoin:miter;');
          continue;
        }
        el.setAttribute(SVG_ATTR_MAP[attr], attrs[attr]);
      }
    }
    model._cfg.attrs = model._attrs;
  }
  _setText(model, text) {
    const el = model._cfg.el;

    if (!text) {
      el.innerHTML = '';
    } else if (~text.indexOf('\n')) {
      const textArr = text.split('\n');
      let arr = '';
      Util.each(textArr, (segment, i) => {
        arr += `<tspan x="0" y="${i + 1}em">${segment}</tspan>`;
      });
      el.innerHTML = arr;
    } else {
      el.innerHTML = text;
    }
  }
  _setClip(model, value) {
    const el = model._cfg.el;
    if (!value) {
      el.removeAttribute('clip-path');
      return;
    }
    this._createDom(value);
    this._updateShape(value);
    const id = this.context.addClip(value);
    el.setAttribute('clip-path', `url(#${id})`);
  }
}

module.exports = Painter;
