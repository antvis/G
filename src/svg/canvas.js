const Util = require('../util/index');
const Event = require('./event');
const Group = require('./core/group');
const Defs = require('./core/defs');
const Timeline = require('../util/mixin/timeline');

const Canvas = function(cfg) {
  Canvas.superclass.constructor.call(this, cfg);
};

Canvas.CFG = {
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
  pixelRatio: Util.getRatio()
};

Util.extend(Canvas, Group);

Util.augment(Canvas, {
  init() {
    Canvas.superclass.init.call(this);
    this._setDOM();
    this._setInitSize();
    // this._scale();
    if (this.get('eventEnable')) {
      this._registEvents();
    }
  },
  getEmitter(element, event) {
    if (element) {
      if (Util.isEmpty(element._getEvents())) {
        const parent = element.get('parent');
        if (parent && !event.propagationStopped) {
          return this.getEmitter(parent, event);
        }
      } else {
        return element;
      }
    }
  },
  _getEventObj(type, e, point, target) {
    const event = new Event(type, e, true, true);
    event.x = point.x;
    event.y = point.y;
    event.clientX = e.clientX;
    event.clientY = e.clientY;
    event.currentTarget = target;
    event.target = target;
    return event;
  },
  _triggerEvent(type, e) {
    const point = this.getPointByClient(e.clientX, e.clientY);
    const shape = this.findShape(e.srcElement);
    let emitObj;
    if (type === 'mousemove') {
      const preShape = this.get('preShape');
      if (preShape && preShape !== shape) {
        const mouseleave = this._getEventObj('mouseleave', e, point, preShape);
        emitObj = this.getEmitter(preShape, e);
        emitObj && emitObj.emit('mouseleave', mouseleave);
      }

      if (shape) {
        const mousemove = this._getEventObj('mousemove', e, point, shape);
        emitObj = this.getEmitter(shape, e);
        emitObj && emitObj.emit('mousemove', mousemove);

        if (preShape !== shape) {
          const mouseenter = this._getEventObj('mouseenter', e, point, shape);
          emitObj && emitObj.emit('mouseenter', mouseenter, e);
        }
      } else {
        const canvasmousemove = this._getEventObj('mousemove', e, point, this);
        this.emit('mousemove', canvasmousemove);
      }
      this.set('preShape', shape);
    } else {
      const event = this._getEventObj(type, e, point, shape || this);
      emitObj = this.getEmitter(shape, e);
      if (emitObj && emitObj !== this) {
        emitObj.emit(type, event);
      }
      this.emit(type, event);
    }

    const el = this.get('el');
    if (shape && !shape.get('destroyed')) {
      el.style.cursor = shape.attr('cursor') || 'default';
    }
  },
  _registEvents() {
    const self = this;
    const el = self.get('el');
    const events = [ 'mouseout',
      'mouseover',
      'mousemove',
      'mousedown',
      'mouseup',
      'click',
      'dblclick'
    ];

    Util.each(events, event => {
      el.addEventListener(event, e => {
        self._triggerEvent(event, e);
      }, false);
    });
    el.addEventListener('touchstart', e => {
      if (!Util.isEmpty(e.touches)) {
        self._triggerEvent('touchstart', e.touches[0]);
      }
    }, false);

    el.addEventListener('touchmove', e => {
      if (!Util.isEmpty(e.touches)) {
        self._triggerEvent('touchmove', e.touches[0]);
      }
    }, false);

    el.addEventListener('touchend', e => {
      if (!Util.isEmpty(e.changedTouches)) {
        self._triggerEvent('touchend', e.changedTouches[0]);
      }
    }, false);
  },
  _setDOM() {
    this._setContainer();
    this._setLayer();
  },
  _setContainer() {
    const containerId = this.get('containerId');
    let containerDOM = this.get('containerDOM');
    if (!containerDOM) {
      containerDOM = document.getElementById(containerId);
      this.set('containerDOM', containerDOM);
    }
    Util.modifyCSS(containerDOM, {
      position: 'relative'
    });
  },
  _setLayer() {
    const containerDOM = this.get('containerDOM');
    const canvasId = Util.uniqueId('svg_');
    if (containerDOM) {
      const canvasDOM = Util.createDom('<svg id="' + canvasId + '"></svg>');
      containerDOM.appendChild(canvasDOM);
      const defs = new Defs();
      canvasDOM.appendChild(defs.get('el'));
      this.set('canvasDOM', canvasDOM);
      this.set('el', canvasDOM);
      this.set('defs', defs);
      this.set('canvas', this);
    }
    const canvasDOM = this.get('canvasDOM');
    const timeline = new Timeline();
    this.setSilent('timeline', timeline);
    this.set('context', canvasDOM);

  },
  _setInitSize() {
    this.changeSize(this.get('width'), this.get('height'));
    this.set('pixelRatio', 1);
  },
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
  },
  getWidth() {
    return this.get('width');
  },
  getHeight() {
    return this.get('height');
  },
  changeSize(width, height) {
    this.set('widthCanvas', width);
    this.set('heightCanvas', height);
    this.set('widthStyle', width + 'px');
    this.set('heightStyle', height + 'px');
    this.set('width', width);
    this.set('height', height);
    this._resize();
  },
  /**
   * 将窗口坐标转变成 canvas 坐标
   * @param  {Number} clientX 窗口x坐标
   * @param  {Number} clientY 窗口y坐标
   * @return {Object} canvas坐标
   */
  getPointByClient(clientX, clientY) {
    const el = this.get('el');
    const bbox = el.getBoundingClientRect();
    return {
      x: clientX - bbox.left,
      y: clientY - bbox.top
    };
  },
  getClientByPoint(x, y) {
    const el = this.get('el');
    const bbox = el.getBoundingClientRect();
    return {
      clientX: x + bbox.left,
      clientY: y + bbox.top
    };
  },
  beforeDraw() {
    const el = this.get('el');
    // canvas版本用盖一个canvas大小的矩阵清空画布，svg换成清空html
    el.innerHTML = '';
  },
  _beginDraw() {
    this.setSilent('toDraw', true);
  },
  _endDraw() {
    this.setSilent('toDraw', false);
  },
  // svg实时渲染，兼容canvas版本留个空接口
  draw() { },
  destroy() {
    const containerDOM = this.get('containerDOM');
    const canvasDOM = this.get('canvasDOM');
    if (canvasDOM && containerDOM) {
      containerDOM.removeChild(canvasDOM);
    }
    Canvas.superclass.destroy.call(this);
  }
});

module.exports = Canvas;
