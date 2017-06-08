import Util from './util/index';
import MouseEvent from './mouse-event';
import G from './g/index';

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
  init: function() {
    /**
     * 执行父类的父类的init方法
     */
    Canvas.superclass.init.call(this);

    /**
     * @SET {Number} pixelRatio 屏幕像素比
     */
    this._setGlobalParam();
    /**
     * @SET {Object} containerDOM 容器
     * @SET {Object} layer        图层
     */
    this._setDOM();
    /**
     * @SET {Number} width    Canvas 宽度
     * @SET {Number} height   Canvas 高度
     * @SET {Number} widthCanvas  px     宽度
     * @SET {Number} heightCanvas px     高度
     */
    this._setInitSize();
    this._setCanvas();
    this._scale();
    if (this.get('eventEnable')) {
      this._registEvents();
    }
  },
  _registEvents: function() {
    var self = this;
    var el = self.get('el');
    var mouseEvent = new MouseEvent(self);

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
  // 初始化缩放
  _scale: function() {
    var pixelRatio = this.get('pixelRatio');
    this.scale(pixelRatio, pixelRatio);
  },
  // 设置画布
  _setCanvas: function() {
    var canvasDOM = this.get('canvasDOM');
    this.set('el', canvasDOM);
    this.set('context', canvasDOM.getContext('2d'));
    this.set('canvas', this);
  },
  /**
   * 设置全局参数
   */
  _setGlobalParam: function() {
    var pixelRatio = this.get('pixelRatio');
    if (!pixelRatio) {
      this.set('pixelRatio', Util.getRatio());
    }
    return;
  },
  /**
   * 设置所有DOM
   */
  _setDOM: function() {
    this._setContainer();
    this._setLayer();
  },
  /**
   * 设置容器DOM
   */
  _setContainer: function() {
    var containerId = this.get('containerId');
    var containerDOM = this.get('containerDOM');
    if (!containerDOM) {
      containerDOM = document.getElementById(containerId);
      this.set('containerDOM', containerDOM);
    }
    Util.modiCSS(containerDOM, {
      position: 'relative'
    });
  },
  /**
   * 设置图层DOM
   */
  _setLayer: function() {
    var containerDOM = this.get('containerDOM');
    var canvasId = Util.uniqueId('canvas_');
    if (containerDOM) {
      var canvasDOM = Util.createDom('<canvas id="' + canvasId + '"></canvas>');
      containerDOM.appendChild(canvasDOM);
      this.set('canvasDOM', canvasDOM);
    }
  },
  /**
   * 设置初始画布参数
   */
  _setInitSize: function() {
    this.changeSize(this.get('width'), this.get('height'));
  },
  /**
   * 重设画布尺寸
   */
  _reSize: function() {
    var canvasDOM = this.get('canvasDOM');
    var widthCanvas = this.get('widthCanvas');
    var heightCanvas = this.get('heightCanvas');
    var widthStyle = this.get('widthStyle');
    var heightStyle = this.get('heightStyle');

    canvasDOM.style.width = widthStyle;
    canvasDOM.style.height = heightStyle;
    canvasDOM.setAttribute('width', widthCanvas);
    canvasDOM.setAttribute('height', heightCanvas);
  },
  /**
   * 获取宽度
   */
  getWidth: function() {
    var pixelRatio = this.get('pixelRatio');
    var width = this.get('width');
    return width * pixelRatio;
  },
  /**
   * 获取高度
   */
  getHeight: function() {
    var pixelRatio = this.get('pixelRatio');
    var height = this.get('height');
    return height * pixelRatio;
  },
  /**
   * 设置画布尺寸
   * @param  {Number} Canvas width
   * @param  {Number} Canvas height
   * @param  {Number} pixelRatio height
   */
  changeSize: function(width, height) {
    var pixelRatio = this.get('pixelRatio');
    var widthCanvas = width * pixelRatio;
    var heightCanvas = height * pixelRatio;

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
  getPointByClient: function(clientX, clientY) {
    var el = this.get('el');
    var bbox = el.getBoundingClientRect();
    var width = bbox.right - bbox.left;
    var height = bbox.bottom - bbox.top;
    return {
      x: (clientX - bbox.left) * (el.width / width),
      y: (clientY - bbox.top) * (el.height / height)
    };
  },
  /**
   * 将 canvas 坐标转变成窗口坐标
   * @param  {Number} x canvas x坐标
   * @param  {Number} x canvas y坐标
   * @return {Object} 窗口坐标
   */
  getClientByPoint: function(x, y) {
    var el = this.get('el');
    var bbox = el.getBoundingClientRect();
    var width = bbox.right - bbox.left;
    var height = bbox.bottom - bbox.top;
    return {
      clientX: x / (el.width / width) + bbox.left,
      clientY: y / (el.height / height) + bbox.top
    };
  },
  beforeDraw: function() {
    var context = this.get('context');
    var el = this.get('el');
    context && context.clearRect(0, 0, el.width, el.height);
  },
  _beginDraw: function() {
    this.setSilent('toDraw', true);
  },
  _endDraw: function() {
    this.setSilent('toDraw', false);
  },
  draw: function() {
    var self = this;
    function drawInner() {
      self.set('animateHandler', Util.requestAnimationFrame(function() {
        self.set('animateHandler', undefined);
        if (self.get('toDraw')) {
          drawInner();
        }
      }));
      self.beforeDraw();
      try {
        var context = self.get('context');
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
    if (self.get('animateHandler')) {
      this._beginDraw();
    } else {
      drawInner();
    }
  },
  /**
   * 销毁
   */
  destroy: function() {
    var containerDOM = this.get('containerDOM');
    var canvasDOM = this.get('canvasDOM');
    if (canvasDOM && containerDOM) {
      containerDOM.removeChild(canvasDOM);
    }
    Canvas.superclass.destroy.call(this);
  }
});

module.exports = Canvas;
