const Util = require('./util/index');
const MouseEvent = require('./mouse-event');
const G = require('./g/index');

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
  pixelRatio: null
};

Util.extend(Canvas, G.Group);

Util.augment(Canvas, {
  init() {
    Canvas.superclass.init.call(this);
    this._setGlobalParam();
    this._setDOM();
    this._setInitSize();
    this._setCanvas();
    this._scale();
    if (this.get('eventEnable')) {
      this._registEvents();
    }
  },
  _registEvents() {
    const self = this;
    const el = self.get('el');
    const mouseEvent = new MouseEvent(self);

    el.addEventListener('mouseout', function(e) {
      mouseEvent.mouseout(e);
    }, false);

    el.addEventListener('mouseover', function(e) {
      mouseEvent.mouseover(e);
    }, false);

    el.addEventListener('mousemove', function(e) {
      mouseEvent.mousemove(e);
    }, false);

    el.addEventListener('mousedown', function(e) {
      mouseEvent.mousedown(e);
    }, false);

    el.addEventListener('mouseup', function(e) {
      mouseEvent.mouseup(e);
    }, false);

    el.addEventListener('click', function(e) {
      mouseEvent.click(e);
    }, false);

    el.addEventListener('dblclick', function(e) {
      mouseEvent.dblclick(e);
    }, false);
  },
  _scale() {
    const pixelRatio = this.get('pixelRatio');
    this.scale(pixelRatio, pixelRatio);
  },
  _setCanvas() {
    const canvasDOM = this.get('canvasDOM');
    this.set('el', canvasDOM);
    this.set('context', canvasDOM.getContext('2d'));
    this.set('canvas', this);
  },
  _setGlobalParam() {
    const pixelRatio = this.get('pixelRatio');
    if (!pixelRatio) {
      this.set('pixelRatio', Util.getRatio());
    }
    return;
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
    Util.modiCSS(containerDOM, {
      position: 'relative'
    });
  },
  _setLayer() {
    const containerDOM = this.get('containerDOM');
    const canvasId = Util.uniqueId('canvas_');
    if (containerDOM) {
      const canvasDOM = Util.createDom('<canvas id="' + canvasId + '"></canvas>');
      containerDOM.appendChild(canvasDOM);
      this.set('canvasDOM', canvasDOM);
    }
  },
  _setInitSize() {
    this.changeSize(this.get('width'), this.get('height'));
  },
  _reSize() {
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
    const pixelRatio = this.get('pixelRatio');
    const width = this.get('width');
    return width * pixelRatio;
  },
  getHeight() {
    const pixelRatio = this.get('pixelRatio');
    const height = this.get('height');
    return height * pixelRatio;
  },
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
    this._reSize();
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
    const width = bbox.right - bbox.left;
    const height = bbox.bottom - bbox.top;
    return {
      x: (clientX - bbox.left) * (el.width / width),
      y: (clientY - bbox.top) * (el.height / height)
    };
  },
  getClientByPoint(x, y) {
    const el = this.get('el');
    const bbox = el.getBoundingClientRect();
    const width = bbox.right - bbox.left;
    const height = bbox.bottom - bbox.top;
    return {
      clientX: x / (el.width / width) + bbox.left,
      clientY: y / (el.height / height) + bbox.top
    };
  },
  beforeDraw() {
    const context = this.get('context');
    const el = this.get('el');
    context && context.clearRect(0, 0, el.width, el.height);
  },
  _beginDraw() {
    this.setSilent('toDraw', true);
  },
  _endDraw() {
    this.setSilent('toDraw', false);
  },
  draw() {
    const self = this;
    function drawInner() {
      // self.set('animateHandler', Util.requestAnimationFrame(function() {
      //   self.set('animateHandler', undefined);
      //   if (self.get('toDraw')) {
      //     drawInner();
      //   }
      // }));
      // self.beforeDraw();
      try {
        const context = self.get('context');
        Canvas.superclass.draw.call(self, context);
        // self._drawCanvas();
      } catch (ev) { // 绘制时异常，中断重绘
        console.warn('error in draw canvas, detail as:');
        console.warn(ev);
        self._endDraw();
      }
      self._endDraw();
    }

    if (self.get('destroyed')) {
      return;
    }
    // if (self.get('animateHandler')) {
    //   this._beginDraw();
    // } else {
    //   drawInner();
    // }
    drawInner();
  },
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
