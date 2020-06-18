import * as Util from '@antv/util';
import * as renderUtil from './util';

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
  'lineDashOffset',
];

class Painter {
  type: string;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  toDraw: boolean;
  animateHandler: any;

  constructor(dom, context) {
    // DOM 容器不存在时，说明为非浏览器环境，此时使用上层传入的 context
    if (!dom) {
      this.type = 'canvas';
      // 从 context 中获取 canvas dom
      this.canvas = context.canvas;
      this.context = context;
      return this;
    }
    const canvasId = Util.uniqueId('canvas_');
    // @ts-ignore
    const canvasDom: HTMLCanvasElement = Util.createDom('<canvas id="' + canvasId + '"></canvas>');
    dom.appendChild(canvasDom);
    this.type = 'canvas';
    this.canvas = canvasDom;
    this.context = canvasDom.getContext('2d');
    return this;
  }
  beforeDraw() {
    const el = this.canvas;
    this.context && this.context.clearRect(0, 0, el.width, el.height);
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
      self.beforeDraw();
      try {
        self._drawGroup(model);
      } catch (ev) {
        // 绘制时异常，中断重绘
        console.warn('error in draw canvas, detail as:');
        console.warn(ev);
      } finally {
        self.toDraw = false;
      }
    }
    if (self.animateHandler) {
      self.toDraw = true;
    } else {
      drawInner();
    }
  }
  drawSync(model) {
    this.beforeDraw();
    this._drawGroup(model);
  }
  _drawGroup(group) {
    if (group.removed || group.destroyed || !group.cfg.visible) {
      return;
    }
    const self = this;
    const children = group.cfg.children;
    let child = null;
    this.setContext(group);
    for (let i = 0; i < children.length; i++) {
      child = children[i];
      if (children[i].isGroup) {
        self._drawGroup(child);
      } else {
        self._drawShape(child);
      }
    }
    this.restoreContext(group);
  }
  _drawShape(shape) {
    if (shape.removed || shape.destroyed || !shape.cfg.visible) {
      return;
    }
    this.setContext(shape);
    shape.drawInner(this.context);
    this.restoreContext(shape);
    shape.cfg.attrs = shape.attrs;
    shape.cfg.hasUpdate = false;
  }
  setContext(shape) {
    const context = this.context;
    const clip = shape.attrs.clip;
    context.save();
    if (clip) {
      // context.save();
      clip.resetTransform(context);
      clip.createPath(context);
      context.clip();
      // context.restore();
    }
    this.resetContext(shape);
    shape.resetTransform(context);
  }
  restoreContext(element?) {
    this.context.restore();
  }
  resetContext(shape) {
    const context = this.context;
    const elAttrs = shape.attrs;
    // var canvas = this.get('canvas');
    if (!shape.isGroup) {
      for (const k in elAttrs) {
        if (SHAPE_ATTRS.indexOf(k) > -1) {
          // 非canvas属性不附加
          let v = elAttrs[k];
          if (k === 'fillStyle') {
            v = renderUtil.parseStyle(v, shape, context);
          }
          if (k === 'strokeStyle') {
            v = renderUtil.parseStyle(v, shape, context);
          }
          if (k === 'lineDash' && context.setLineDash) {
            if (Util.isArray(v)) {
              context.setLineDash(v);
            } else if (Util.isString(v)) {
              // @ts-ignore
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

export default Painter;
