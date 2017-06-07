/**
 * @fileOverview 图形控件或者分组的基类
 * @author dxq613@gmail.com
 * @author hankaiai@126.com
 * @ignore
 */
var Util = require('../../util/index');
var Attributes = require('./mixin/attributes');
var Transform = require('./mixin/transform');
var Animate = require('./mixin/animate');
var Format = require('../format');
// var Vector3 = require('@ali/g-matrix').Vector3;
var EventDispatcher = require('../../event/eventDispatcher');

var SHAPE_ATTRS = [
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
  'lineDash'
];

var Element = function(cfg) {
  this.__cfg = {
    zIndex: 0,
    capture: true,
    visible: true,
    destroyed: false
  }; // 配置存放地

  Util.assign(this.__cfg, this.getDefaultCfg(), cfg); // Element.CFG不合并，提升性能 合并默认配置，用户配置->继承默认配置->Element默认配置
  this.initAttrs(this.__cfg.attrs); // 初始化绘图属性
  this.initTransform(); // 初始化变换
  this.initEventDispatcher();
  this.init(); // 类型初始化
};

Element.CFG = {
  /**
   * 唯一标示
   * @type {Number}
   */
  id: null,
  /**
   * Z轴的层叠关系，Z值越大离用户越近
   * @type {Number}
   */
  zIndex: 0,
  /**
   * Canvas对象
   * @type: {Object}
   */
  canvas: null,
  /**
   * 父元素指针
   * @type {Object}
   */
  parent: null,
  /**
   * 用来设置当前对象是否能被捕捉
   * true 能
   * false 不能
   * 对象默认是都可以被捕捉的, 当capture为false时，group.getShape(x, y)方法无法获得该元素
   * 通过将不必要捕捉的元素的该属性设置成false, 来提高捕捉性能
   **/
  capture: true,
  /**
   * 画布的上下文
   * @type {Object}
   */
  context: null,
  /**
   * 是否显示
   * @type {Boolean}
   */
  visible: true,
  /**
   * 是否被销毁
   * @type: {Boolean}
   */
  destroyed: false
};

Util.augment(Element, Attributes, EventDispatcher, Transform, Animate, {
  /**
   * @protected
   * 初始化
   */
  init: function() {
    this.setSilent('animable', true);
    var attrs = this.__attrs;
    if (attrs && attrs.rotate) {
      this.rotateAtStart(attrs.rotate);
    }
  },
  getParent: function() {
    return this.get('parent');
  },
  /**
   * 获取默认的配置信息
   * @protected
   * @return {Object} 默认的属性
   */
  getDefaultCfg: function() {
    return {};
  },
  /**
   * 设置属性信息
   * @protected
   */
  set: function(name, value) {
    var m = '__set' + Util.upperFirst(name);

    if (this[m]) {
      value = this[m](value);
    }
    this.__cfg[name] = value;
    return this;
  },
  /**
   * 设置属性信息,不进行特殊处理
   * @protected
   */
  setSilent: function(name, value) {
    this.__cfg[name] = value;
  },
  /**
   * 获取属性信息
   * @protected
   */
  get: function(name) {
    return this.__cfg[name];
  },
  /**
   * 绘制自身
   */
  draw: function(context) {
    if (this.get('destroyed')) {
      return;
    }
    if (this.get('visible')) {
      this.setContext(context);
      this.drawInner(context);
      this.restoreContext(context);
    }
  },
  setContext: function(context) {
    var clip = this.__attrs.clip;
    context.save();
    if (clip) {
      // context.save();
      clip.resetTransform(context);
      clip.createPath(context);
      context.clip();
      // context.restore();
    }
    this.resetContext(context);
    this.resetTransform(context);
  },
  restoreContext: function(context) {
    context.restore();
  },
  /**
   * @protected
   * 设置绘图属性
   */
  resetContext: function(context) {
    var elAttrs = this.__attrs;
    // var canvas = this.get('canvas');
    if (!this.isGroup) {
      // canvas.registShape(this); // 快速拾取方案暂时不执行
      for (var k in elAttrs) {
        if (SHAPE_ATTRS.indexOf(k) > -1) { // 非canvas属性不附加
          var v = elAttrs[k];
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
  },
  /**
   * @protected
   * 绘制内部图形
   */
  drawInner: function(/* context */) {

  },
  show: function() {
    this.set('visible', true);
    return this;
  },
  hide: function() {
    this.set('visible', false);
    return this;
  },
  /**
   * 删除自己, 从父元素中删除自己
   * @param  {Boolean} [destroy=true]
   */
  remove: function(destroy) {
    if (destroy === undefined) {
      destroy = true;
    }

    if (this.get('parent')) {
      var parent = this.get('parent');
      var children = parent.get('children');
      Util.remove(children, this);
      // this.set('parent', null);
    }

    if (destroy) {
      this.destroy();
    }

    return this;
  },
  destroy: function() {
    var destroyed = this.get('destroyed');

    if (destroyed) {
      return;
    }
    this.__cfg = {};
    this.__attrs = null;
    this.__listeners = null;
    this.__m = null;
    this.set('destroyed', true);
  },
  __setZIndex: function(zIndex) {
    this.__cfg.zIndex = zIndex;
    if (!Util.isNull(this.get('parent'))) {
      this.get('parent').sort();
    }
    return zIndex;
  },
  __setAttrs: function(attrs) {
    this.attr(attrs);
    return attrs;
  },
  clone: function() {
    return Util.clone(this);
  },
  getBBox: function() {
    return {
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0
    };
  }
});

module.exports = Element;
