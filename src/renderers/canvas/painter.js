const Util = require('../../util');
const Format = require('../../util/format');

const SHAPE_ATTRS = [
  'fillStyle',
  'font',
  'globalAlpha',
  'lineCap',
  'lineWidth',
  'lineJoin',
  'miterLimit',
  'shadowBlur',
  'shadowColor',
  'shadowOffsetX',
  'shadowOffsetY',
  'strokeStyle',
  'textAlign',
  'textBaseline',
  'lineDash',
  'lineDashOffset'
];

class Painter {
  type = 'canvas';
  model = null;
  constructor(canvas, context) {
    this.type = 'canvas';
    this.canvas = canvas;
    this.context = context;
    this.model = null;
  }
  draw(newModel) {
    this._drawGroup(newModel);
  }
  _drawGroup(group) {
    if (group._cfg.removed || group._cfg.destroyed || !group._cfg.visible) {
      return;
    }
    const self = this;
    const children = group._cfg.children;
    let child = null;
    for (let i = 0; i < children.length; i++) {
      child = children[i];
      if (children[i].isGroup) {
        self._drawGroup(child);
      } else {
        self._drawShape(child);
      }
    }
  }
  _drawShape(shape) {
    if (shape._cfg.removed || shape._cfg.destroyed || !shape._cfg.visible) {
      return;
    }
    this.setContext();
    shape.drawInner();
    this.restoreContext();
  }
  setContext(shape) {
    const context = this.context;
    const clip = shape._attrs.clip;
    context.save();
    if (clip) {
      // context.save();
      clip.resetTransform(context);
      clip.createPath(context);
      context.clip();
      // context.restore();
    }
    this.resetContext(context);
    shape.resetTransform(context);
  }
  restoreContext() {
    this.context.restore();
  }
  resetContext(context) {
    const elAttrs = this.__attrs;
    // var canvas = this.get('canvas');
    if (!this.isGroup) {
      // canvas.registShape(this); // 快速拾取方案暂时不执行
      for (const k in elAttrs) {
        if (SHAPE_ATTRS.indexOf(k) > -1) { // 非canvas属性不附加
          let v = elAttrs[k];
          if (k === 'fillStyle') {
            v = Format.parseStyle(v, this);
          }
          if (k === 'strokeStyle') {
            v = Format.parseStyle(v, this);
          }
          if (k === 'lineDash' && context.setLineDash) {
            if (Util.isArray(v)) {
              context.setLineDash(v);
            } else if (Util.isString(v)) {
              context.setLineDash(v.split(' '));
            }
          } else {
            context[k] = v;
          }
        }
      }
    }
  }
}

module.exports = Painter;
