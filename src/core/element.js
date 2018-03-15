const Util = require('../util/index');
const Attribute = require('./mixin/attribute');
const Transform = require('./mixin/transform');
const Animate = require('./mixin/animate');
const Format = require('../util/format');
const EventEmitter = require('wolfy87-eventemitter');

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

const Element = function(cfg) {
  this.__cfg = {
    zIndex: 0,
    capture: true,
    visible: true,
    destroyed: false
  }; // 配置存放地

  Util.assign(this.__cfg, this.getDefaultCfg(), cfg); // Element.CFG不合并，提升性能 合并默认配置，用户配置->继承默认配置->Element默认配置
  this.initAttrs(this.__cfg.attrs); // 初始化绘图属性
  this.initTransform(); // 初始化变换
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
   * @type {Boolean}
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

Util.augment(Element, Attribute, Transform, EventEmitter, Animate, {
  init() {
    this.setSilent('animable', true);
    this.setSilent('animating', false); // 初始时不处于动画状态
    const attrs = this.__attrs;
    if (attrs && attrs.rotate) {
      this.rotateAtStart(attrs.rotate);
    }
  },
  getParent() {
    return this.get('parent');
  },
  /**
   * 获取默认的配置信息
   * @protected
   * @return {Object} 默认的属性
   */
  getDefaultCfg() {
    return {};
  },
  set(name, value) {
    const m = '__set' + Util.upperFirst(name);

    if (this[m]) {
      value = this[m](value);
    }
    this.__cfg[name] = value;
    return this;
  },
  setSilent(name, value) {
    this.__cfg[name] = value;
  },
  get(name) {
    return this.__cfg[name];
  },
  draw(context) {
    if (this.get('destroyed')) {
      return;
    }
    if (this.get('visible')) {
      this.setContext(context);
      this.drawInner(context);
      this.restoreContext(context);
    }
  },
  setContext(context) {
    const clip = this.__attrs.clip;
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
  restoreContext(context) {
    context.restore();
  },
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
  },
  drawInner(/* context */) {

  },
  show() {
    this.set('visible', true);
    return this;
  },
  hide() {
    this.set('visible', false);
    return this;
  },
  remove(destroy) {
    if (destroy === undefined) {
      destroy = true;
    }

    if (this.get('parent')) {
      const parent = this.get('parent');
      const children = parent.get('children');
      Util.remove(children, this);
    }

    if (destroy) {
      this.destroy();
    }

    return this;
  },
  destroy() {
    const destroyed = this.get('destroyed');
    if (destroyed) {
      return;
    }
    // 如果正在执行动画，清理动画
    if (this.get('animating')) {
      const timer = this.get('animateTimer');
      timer && timer.stop();
    }
    this.__cfg = {};
    this.__attrs = null;
    this.removeEvent(); // 移除所有的事件
    this.set('destroyed', true);
  },
  __setZIndex(zIndex) {
    this.__cfg.zIndex = zIndex;

    if (!Util.isNil(this.get('parent'))) {
      this.get('parent').sort();
    }
    return zIndex;
  },
  __setAttrs(attrs) {
    this.attr(attrs);
    return attrs;
  },
  setZIndex(zIndex) {
    this.__cfg.zIndex = zIndex;
    return zIndex;
  },
  clone() {
    return Util.clone(this);
  },
  getBBox() {
    return {
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0
    };
  }
});

module.exports = Element;
