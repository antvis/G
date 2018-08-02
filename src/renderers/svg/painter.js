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
  fillStyle: 'fill',
  strokeOpacity: 'stroke-opacity',
  fillOpacity: 'fill-opacity',
  strokeStyle: 'stroke',
  x: 'x',
  y: 'y',
  r: 'r',
  width: 'width',
  height: 'height',
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
  id: 'id',
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
    const canvasDom = Util.createDom(`<svg id="${svgId}"></svg>`);
    dom.appendChild(canvasDom);
    this.type = 'svg';
    this.canvas = canvasDom;
    this.context = new Defs(canvasDom);
    this.toDraw = false;
    return this;
  }
  draw(model) {
    const self = this;
    function drawInner() {
      self.animateHandler = Util.requestAnimationFrame(() => {
        self.animateHandler = undefined;
        if (self.toDraw) {
          drawInner();
        }
      });
      try {
        self._drawChildren(model._cfg.children);
      } catch (ev) { // 绘制时异常，中断重绘
        console.warn('error in draw canvas, detail as:');
        console.warn(ev);
        self.toDraw = false;
      }
      self.toDraw = false;
    }
    if (self.animateHandler) {
      self.toDraw = true;
    } else {
      drawInner();
    }
  }
  _drawGroup(model) {
    this._drawShape(model);
    this._drawChildren(model._cfg.children);
  }
  _drawChildren(children) {
    const self = this;
    let shape;
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
    const attrs = model._attrs;
    const cfg = model._cfg;
    // 删除
    if (cfg.removed || cfg.destroyed) {
      if (cfg.el) {
        cfg.el.parentNode.removeChild(cfg.el);
      }
      return;
    }

    // 新增节点
    if (!cfg.el && cfg.parent) {
      self._createDom(model);
      self._updateShape(model);
    }

    if (cfg.visible === false) {
      cfg.el.setAttribute('visibility', 'hidden');
      return;
    }
    cfg.el.setAttribute('visibility', 'visible');


    // 更新
    if (cfg.hasUpdate) {
      self._updateShape(model);
    }
    if (attrs.clip && attrs.clip._cfg.hasUpdate) {
      self._updateShape(attrs.clip);
    }
  }
  _updateShape(model) {
    const self = this;
    const attrs = model._attrs;
    const formerAttrs = model._cfg.attrs;
    if (!formerAttrs) {
      return;
    }
    if (!model._cfg.el) {
      self._createDom(model);
    }
    if ('clip' in attrs) {
      this._setClip(model, attrs.clip);
    }
    if ('shadowOffsetX' in attrs || 'shadowOffsetY' in attrs || 'shadowBlur' in attrs || 'shadowColor' in attrs) {
      this._setShadow(model);
    }
    if (model.type === 'text') {
      self._updateText(model);
      return;
    }
    if (model.type === 'fan') {
      self._updateFan(model);
    }
    if (model.type === 'marker') {
      model._cfg.el.setAttribute('d', self._assembleMarker(attrs));
    }
    for (const key in attrs) {
      if (attrs[key] !== formerAttrs[key]) {
        self._setAttribute(model, key, attrs[key]);
      }
    }
    model._cfg.attrs = Util.deepMix({}, model._attrs);
    model._cfg.hasUpdate = false;
  }
  _setAttribute(model, name, value) {
    const type = model.type;
    const attrs = model._attrs;
    const el = model._cfg.el;
    const defs = this.context;

    // 计算marker路径
    if (type === 'marker' && ~[ 'x', 'y', 'radius', 'r' ].indexOf(name)) {
      return;
    }
    // 圆和椭圆不是x, y， 是cx, cy。 marker的x,y 用于计算marker的路径，不需要写到dom
    if (~[ 'circle', 'ellipse' ].indexOf(type) && ~[ 'x', 'y' ].indexOf(name)) {
      el.setAttribute('c' + name, parseInt(value, 10));
      return;
    }
    // 圆角矩形
    if (type === 'rect' && name === 'radius') {
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
      return;
    }
    // 设置path
    if (name === 'path' && Util.isArray(value)) {
      el.setAttribute('d', this._formatPath(value));
      return;
    }
    // 设置图片
    if (name === 'img') {
      this._setImage(model, value);
      return;
    }
    if (name === 'transform') {
      if (!value) {
        el.removeAttribute('transform');
        return;
      }
      this._setTransform(model);
      return;
    }
    if (name === 'rotate') {
      if (!value) {
        el.removeAttribute('transform');
        return;
      }
      this._setTransform(model);
      return;
    }
    if (name === 'matrix') {
      this._setTransform(model);
      return;
    }
    if (name === 'fillStyle' || name === 'strokeStyle') {
      this._setColor(model, name, value);
      return;
    }
    if (name === 'clip') {
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
    if (SVG_ATTR_MAP[name]) {
      el.setAttribute(SVG_ATTR_MAP[name], value);
    }
  }
  _createDom(model) {
    const type = SHAPE_TO_TAGS[model.type];
    const attrs = model._attrs;
    if (!type) {
      throw new Error('the type' + model.type + 'is not supported by svg');
    }
    const shape = document.createElementNS('http://www.w3.org/2000/svg', type);
    const id = model._attrs.id || Util.uniqueId(this.type + '_');
    shape.id = id;
    model._cfg.el = shape;
    if (model._cfg.parent) {
      model._cfg.parent.get('el').appendChild(shape);
    }
    if (model.type === 'text') {
      shape.setAttribute('paint-order', 'stroke');
      shape.setAttribute('style', 'stroke-linecap:butt; stroke-linejoin:miter;');
    } else {
      if (!attrs.stroke && !attrs.strokeStyle) {
        attrs.strokeStyle = 'none';
      }
      if (!attrs.fill && !attrs.fillStyle) {
        attrs.fillStyle = 'none';
      }
    }
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
        el.setAttribute('width', img.width);
        model._attrs.width = img.width;
      }
      if (!attrs.height) {
        el.setAttribute('height', img.height);
        model._attrs.height = img.height;
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
        el.setAttribute('width', img.width);
        model._attrs.width = img.width;
      }
      if (!attrs.height) {
        el.setAttribute('height', img.height);
        model._attrs.height = img.height;
      }
      el.setAttribute('href', canvas.toDataURL());
    }
  }
  _updateFan(model) {
    function getPoint(angle, radius, center) {
      return {
        x: radius * Math.cos(angle) + center.x,
        y: radius * Math.sin(angle) + center.y
      };
    }
    const attrs = model._attrs;
    const cfg = model._cfg;
    const center = {
      x: attrs.x,
      y: attrs.y
    };
    const d = [];
    const startAngle = attrs.startAngle;
    let endAngle = attrs.endAngle;
    if (Util.isNumberEqual((endAngle - startAngle), Math.PI * 2)) {
      endAngle -= 0.00001;
    }
    const outerStart = getPoint(startAngle, attrs.re, center);
    const outerEnd = getPoint(endAngle, attrs.re, center);
    const fa = endAngle > startAngle ? 1 : 0;
    const fs = Math.abs(endAngle - startAngle) > Math.PI ? 1 : 0;
    const rs = attrs.rs;
    const re = attrs.re;
    const innerStart = getPoint(startAngle, attrs.rs, center);
    const innerEnd = getPoint(endAngle, attrs.rs, center);
    if (attrs.rs > 0) {
      d.push(`M ${outerEnd.x},${outerEnd.y}`);
      d.push(`L ${innerEnd.x},${innerEnd.y}`);
      d.push(`A ${rs},${rs},0,${fs},${fa === 1 ? 0 : 1},${innerStart.x},${innerStart.y}`);
      d.push(`L ${outerStart.x} ${outerStart.y}`);
    } else {
      d.push(`M ${center.x},${center.y}`);
      d.push(`L ${outerStart.x},${outerStart.y}`);
    }
    d.push(`A ${re},${re},0,${fs},${fa},${outerEnd.x},${outerEnd.y}`);
    if (attrs.rs > 0) {
      d.push(`L ${innerEnd.x},${innerEnd.y}`);
    } else {
      d.push('Z');
    }
    cfg.el.setAttribute('d', d.join(' '));
  }
  _updateText(model) {
    const self = this;
    const attrs = model._attrs;
    const formerAttrs = model._cfg.attrs;
    const el = model._cfg.el;
    this._setFont(model);
    for (const attr in attrs) {
      if (attrs[attr] !== formerAttrs[attr]) {
        if (attr === 'text') {
          self._setText(model, attrs[attr]);
          continue;
        }
        if (attr === 'fillStyle' || attr === 'strokeStyle') {
          this._setColor(model, attr, attrs[attr]);
          continue;
        }
        if (attr === 'matrix') {
          this._setTransform(model);
          continue;
        }
        if (SVG_ATTR_MAP[attr]) {
          el.setAttribute(SVG_ATTR_MAP[attr], attrs[attr]);
        }
      }
    }
    model._cfg.attrs = Object.assign({}, model._attrs);
    model._cfg.hasUpdate = false;
  }
  _setFont(model) {
    const el = model.get('el');
    const attrs = model._attrs;
    const fontSize = attrs.fontSize;

    el.setAttribute('alignment-baseline', BASELINE_MAP[attrs.textBaseline] || 'baseline');
    el.setAttribute('text-anchor', ANCHOR_MAP[attrs.textAlign] || 'left');
    if (fontSize && +fontSize < 12) { // 小于 12 像素的文本进行 scale 处理
      attrs.matrix = [ 1, 0, 0, 0, 1, 0, 0, 0, 1 ];
      model.transform([
        [ 't', -attrs.x, -attrs.y ],
        [ 's', +fontSize / 12, +fontSize / 12 ],
        [ 't', attrs.x, attrs.y ]
      ]);
    }
  }
  _setText(model, text) {
    const el = model._cfg.el;
    if (!text) {
      el.innerHTML = '';
    } else if (~text.indexOf('\n')) {
      const x = model._attrs.x;
      const textArr = text.split('\n');
      let arr = '';
      Util.each(textArr, segment => {
        arr += `<tspan x="${x}" dy="1em">${segment}</tspan>`;
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
    if (!el.hasAttribute('clip-path')) {
      this._createDom(value);
      this._updateShape(value);
      const id = this.context.addClip(value);
      el.setAttribute('clip-path', `url(#${id})`);
    } else if (value._cfg.hasUpdate) {
      this._updateShape(value);
    }
  }
  _setColor(model, name, value) {
    const el = model._cfg.el;
    const defs = this.context;
    if (!value) {
      el.setAttribute(SVG_ATTR_MAP[name], 'none');
      return;
    }
    value = value.trim();
    if (/^[r,R,L,l]{1}[\s]*\(/.test(value)) {
      let id = defs.find('gradient', value);
      if (!id) {
        id = defs.addGradient(value);
      }
      el.setAttribute(SVG_ATTR_MAP[name], `url(#${id})`);
    } else if (/^[p,P]{1}[\s]*\(/.test(value)) {
      let id = defs.find('pattern', value);
      if (!id) {
        id = defs.addPattern(value);
      }
      el.setAttribute(SVG_ATTR_MAP[name], `url(#${id})`);
    } else {
      el.setAttribute(SVG_ATTR_MAP[name], value);
    }
  }
  _setShadow(model) {
    const el = model._cfg.el;
    const attrs = model._attrs;
    const cfg = {
      dx: attrs.shadowOffsetX,
      dy: attrs.shadowOffsetY,
      blur: attrs.shadowBlur,
      color: attrs.shadowColor
    };
    let id = this.context.find('filter', cfg);
    if (!id) {
      id = this.context.addShadow(cfg, this);
    }
    el.setAttribute('filter', `url(#${id})`);
  }
}

module.exports = Painter;
