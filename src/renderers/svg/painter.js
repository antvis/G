const Util = require('../../util');
const Defs = require('./defs');

const SHAPE_TO_TAGS = {
  rect: 'rect',
  circle: 'circle',
  line: 'line',
  path: 'path',
  marker: 'marker',
  text: 'text',
  polygon: 'polygon',
  image: 'image',
  ellipse: 'ellipse',
  dom: 'foreignObject',
  fan: 'path',
  group: 'g'
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

    if (cfg.removed || cfg.destroyed) {
      return;
    }

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

    // 新增节点
    if (!cfg.el && cfg.parent) {
      self._createDom(model);
      self._updateShape(model);
    }

    // 更新
    if (model._attrs.hasUpdate) {
      self._updateShape(model);
    }

    // 删除
    if (model.removed || model.destroyed) {
      self._removeShape(model);
    }
  }
  _updateShape(model) {
    const self = this;
    const attrs = model._attrs;
    if (!model._cfg.el) {
      self._createDom(model);
    }
    for (const key in attrs) {
      self._setAttribute(model, key, attrs[key]);
    }
  }
  _removeShape(model) {
    const el = model._cfg.el;
    if (el) {
      model._cfg.parent.get('el').removeChild(el);
    }
  }
  _setAttribute(model, name, value) {
    console.log(model, name, value);
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
    return shape;
  }
}

module.exports = Painter;
