import * as Util from '@antv/util';
import { detect } from 'detect-browser';
import * as renderers from './renderers/index';
import Event from './event';
import Timeline from './core/timeline';
import Group from './core/group';

const browser = detect();
const isFirefox = browser && browser.name === 'firefox';

const EVENTS = [
  'click',
  'mousedown',
  'mouseup',
  'dblclick',
  'contextmenu',
  'mouseenter',
  'mouseleave',
  'mouseover',
  'mouseout',
  'mousemove',
  'wheel',
];

let preShape = null;
let mousedown = null;
let dragging = null;

class Canvas extends Group {
  constructor(cfg) {
    super({
      eventEnable: true,
      /**
       * 像素宽度
       * @type {Number}
       */
      width: null,
      /**
       * 像素高度
       * @type {Number}
       */
      height: null,
      /**
       * 画布宽度
       * @type {Number}
       */
      widthCanvas: null,
      /**
       * 画布高度
       * @type {Number}
       */
      heightCanvas: null,
      /**
       * CSS宽
       * @type {String}
       */
      widthStyle: null,
      /**
       * CSS高
       * @type {String}
       */
      heightStyle: null,
      /**
       * 容器DOM
       * @type {Object}
       */
      containerDOM: null,
      /**
       * 当前Canvas的DOM
       * @type {Object}
       */
      canvasDOM: null,
      /**
       * 屏幕像素比
       * @type {Number}
       */
      pixelRatio: null,
      /**
       * 渲染器，默认是canvas
       * @type {String}
       */
      renderer: 'canvas',
      /**
       * 是否支持 CSS Transform
       * CSS transform 目前尚未经过长时间验证，为了避免影响上层业务，默认关闭，上层按需开启
       */
      supportCSSTransform: false,
      ...cfg,
    });
    this._setGlobalParam();
    this._setContainer();
    this._initPainter();
    this._scale();
    if (this.get('eventEnable')) {
      this.registerEvent();
    }
  }

  _scale() {
    if (this.cfg.renderType !== 'svg') {
      const pixelRatio = this.get('pixelRatio');
      this.scale(pixelRatio, pixelRatio);
    }
  }

  _setGlobalParam() {
    const renderType = this.get('renderer') || 'canvas';
    if (renderType === 'svg') {
      this.set('pixelRatio', 1);
    } else if (!this.get('pixelRatio')) {
      this.set('pixelRatio', Util.getRatio());
    }
    this.cfg.renderType = renderType;
    const renderer = renderers[renderType];
    this.cfg.renderer = renderer;
    this.cfg.canvas = this;
    const timeline = new Timeline(this);
    this.cfg.timeline = timeline;
  }

  _setContainer() {
    const containerId = this.get('containerId');
    let containerDOM = this.get('containerDOM');
    if (!containerDOM) {
      containerDOM = document.getElementById(containerId);
      this.set('containerDOM', containerDOM);
    }
    Util.modifyCSS(containerDOM, {
      position: 'relative',
    });
  }

  _initPainter() {
    const containerDOM = this.get('containerDOM');
    const painter = new this.cfg.renderer.painter(containerDOM);
    this.cfg.painter = painter;
    this.cfg.canvasDOM = this.cfg.el = painter.canvas;
    this.changeSize(this.get('width'), this.get('height'));
  }

  _resize() {
    const canvasDOM = this.get('canvasDOM');
    const widthCanvas = this.get('widthCanvas');
    const heightCanvas = this.get('heightCanvas');
    const widthStyle = this.get('widthStyle');
    const heightStyle = this.get('heightStyle');

    canvasDOM.style.width = widthStyle;
    canvasDOM.style.height = heightStyle;
    canvasDOM.setAttribute('width', widthCanvas);
    canvasDOM.setAttribute('height', heightCanvas);
  }

  getWidth() {
    const pixelRatio = this.get('pixelRatio');
    const width = this.get('width');
    return width * pixelRatio;
  }

  getHeight() {
    const pixelRatio = this.get('pixelRatio');
    const height = this.get('height');
    return height * pixelRatio;
  }

  changeSize(width, height) {
    const pixelRatio = this.get('pixelRatio');
    const widthCanvas = width * pixelRatio;
    const heightCanvas = height * pixelRatio;

    this.set('widthCanvas', widthCanvas);
    this.set('heightCanvas', heightCanvas);
    this.set('widthStyle', width + 'px');
    this.set('heightStyle', height + 'px');
    this.set('width', width);
    this.set('height', height);
    this._resize();
  }

  // 实现接口
  getPointByEvent(ev) {
    const supportCSSTransform = this.get('supportCSSTransform');
    if (supportCSSTransform) {
      const pixelRatio = this.get('pixelRatio') || 1;
      // For Firefox <= 38
      if (isFirefox && !Util.isNil(ev.layerX) && ev.layerX !== ev.offsetX) {
        return {
          x: ev.layerX * pixelRatio,
          y: ev.layerY * pixelRatio,
        };
      }
      if (!Util.isNil(ev.offsetX)) {
        // For IE6+, Firefox >= 39, Chrome, Safari, Opera
        return {
          x: ev.offsetX * pixelRatio,
          y: ev.offsetY * pixelRatio,
        };
      }
    }
    // should calculate by self for other cases, like Safari in ios
    // TODO: support CSS transform
    const { x: clientX, y: clientY } = this.getClientByEvent(ev);
    return this.getPointByClient(clientX, clientY);
  }

  // 获取 touch 事件的 clientX 和 clientY 需要单独处理
  getClientByEvent(ev) {
    let clientInfo = ev;
    if (ev.touches) {
      if (ev.type === 'touchend') {
        clientInfo = ev.changedTouches[0];
      } else {
        clientInfo = ev.touches[0];
      }
    }
    return {
      x: clientInfo.clientX,
      y: clientInfo.clientY,
    };
  }

  /**
   * 将窗口坐标转变成 canvas 坐标
   * @param  {Number} clientX 窗口x坐标
   * @param  {Number} clientY 窗口y坐标
   * @return {Object} canvas坐标
   */
  getPointByClient(clientX, clientY) {
    const el = this.get('el');
    const pixelRatio = this.get('pixelRatio') || 1;
    const bbox = el.getBoundingClientRect();
    return {
      x: (clientX - bbox.left) * pixelRatio,
      y: (clientY - bbox.top) * pixelRatio,
    };
  }

  getClientByPoint(x, y) {
    const el = this.get('el');
    const bbox = el.getBoundingClientRect();
    const pixelRatio = this.get('pixelRatio') || 1;
    return {
      clientX: x / pixelRatio + bbox.left,
      clientY: y / pixelRatio + bbox.top,
    };
  }

  draw() {
    this.cfg.painter.draw(this);
  }

  getShape(x, y, e?) {
    if (arguments.length === 3 && this.cfg.renderer.getShape) {
      return this.cfg.renderer.getShape.call(this, x, y, e);
    }
    return super.getShape(x, y);
  }

  getRenderer() {
    return this.cfg.renderType;
  }

  _drawSync() {
    this.cfg.painter.drawSync(this);
  }

  destroy() {
    const cfg = this.cfg;
    const containerDOM = cfg.containerDOM;
    const canvasDOM = cfg.canvasDOM;
    if (canvasDOM && containerDOM) {
      containerDOM.removeChild(canvasDOM);
    }
    cfg.timeline.stop();
    super.destroy();
  }

  registerEvent() {
    const self = this;
    const el = this.get('el');

    Util.each(EVENTS, (evt) => {
      el.addEventListener(
        evt,
        (e) => {
          self._triggerEvent(evt, e);
        },
        false
      );
    });
    // special cases
    el.addEventListener(
      'touchstart',
      (e) => {
        if (!Util.isEmpty(e.targetTouches)) {
          self._triggerEvent('touchstart', e);
        }
      },
      false
    );

    el.addEventListener(
      'touchmove',
      (e) => {
        if (!Util.isEmpty(e.targetTouches)) {
          self._triggerEvent('touchmove', e);
        }
      },
      false
    );

    el.addEventListener(
      'touchend',
      (e) => {
        if (!Util.isEmpty(e.changedTouches)) {
          self._triggerEvent('touchend', e);
        }
      },
      false
    );
  }
  _getEmitter(element, event) {
    if (element) {
      if (Util.isEmpty(element.getEvents())) {
        const parent = element.get('parent');
        if (parent && !event.propagationStopped) {
          return this._getEmitter(parent, event);
        }
      } else {
        return element;
      }
    }
  }

  _getEventObj(type, e, point, target) {
    const event = new Event(type, e, true, true);
    event.x = point.x;
    event.y = point.y;
    event.clientX = e.clientX;
    event.clientY = e.clientY;
    event.target = target;
    event.currentTarget = this._getEmitter(target, event);
    return event;
  }

  _triggerEvent(type, e) {
    const point = this.getPointByEvent(e);
    let shape = this.getShape(point.x, point.y, e);
    const el = this.get('el');
    // svg原生事件取不到dragover, dragout, drop等事件的对象。这边需要走数学拾取。
    if (dragging && this.getRenderer() === 'svg') {
      shape = this.getShape(point.x, point.y);
    }
    if (type === 'mousemove') {
      if (preShape && preShape !== shape) {
        this._emitEvent('mouseout', e, point, preShape);
        this._emitEvent('mouseleave', e, point, preShape);
        if (dragging) {
          this._emitEvent('dragleave', e, point, preShape);
        }
        if (!preShape.destroyed && !preShape.removed) {
          el.style.cursor = preShape.attr('cursor') || 'default';
        }
      }

      if (dragging) {
        this._emitEvent('drag', e, point, dragging);
        this._emitEvent('mousemove', e, point, shape || this);
      }

      if (shape) {
        if (!dragging) {
          if (mousedown === shape) {
            dragging = shape;
            mousedown = null;
            this._emitEvent('dragstart', e, point, shape);
          } else {
            this._emitEvent('mousemove', e, point, shape);
          }
        }
        if (preShape !== shape) {
          this._emitEvent('mouseenter', e, point, shape);
          this._emitEvent('mouseover', e, point, shape);
          if (dragging) {
            this._emitEvent('dragenter', e, point, shape);
          }
        }
      } else {
        const canvasmousemove = this._getEventObj('mousemove', e, point, this);
        this.emit('mousemove', canvasmousemove);
      }
      preShape = shape;
    } else {
      this._emitEvent(type, e, point, shape || this);
      if (!dragging && type === 'mousedown') {
        mousedown = shape;
      }
      if (type === 'mouseup') {
        mousedown = null;
        if (dragging) {
          dragging.cfg.capture = true;
          this._emitEvent('dragend', e, point, dragging);
          dragging = null;
          this._emitEvent('drop', e, point, shape || this);
        }
      }
    }
    if (shape && !shape.destroyed) {
      el.style.cursor = shape.attr('cursor') || 'default';
    }
  }

  _emitEvent(type, evt, point, shape) {
    const event = this._getEventObj(type, evt, point, shape);
    const emitShape = this._getEmitter(shape, evt);
    emitShape && emitShape.emit(type, event);
    return emitShape;
  }
}

export default Canvas;
