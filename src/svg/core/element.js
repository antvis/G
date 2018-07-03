const Util = require('../../util/index');
const Attribute = require('./mixin/attribute');
const Transform = require('./mixin/transform');
const Animate = require('../../util/mixin/animation');
const EventEmitter = require('wolfy87-eventemitter');

const Element = function(cfg) {
  this.__cfg = {
    zIndex: 0,
    capture: true,
    visible: true,
    destroyed: false
  }; // 配置存放地

  Util.assign(this.__cfg, this.getDefaultCfg(), cfg); // Element.CFG不合并，提升性能 合并默认配置，用户配置->继承默认配置->Element默认配置
  // 在子元素的init中创建新svg元素，然后设置属性和变换。在这边设置id而不是attr里，是考虑id一旦设置后应不能修改
  this.init(cfg ? cfg.id : null); // 类型初始化
  this.initAttrs(this.__cfg.attrs); // 初始化绘图属性
  this.initTransform(); // 初始化变换
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
    if (name === 'zIndex') {
      this._beforeSetZIndex(value);
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
  draw() {},
  drawInner() {},
  show() {
    this.set('visible', true);
    const el = this.get('el');
    if (el) {
      el.setAttribute('visibility', 'visible');
    }
    return this;
  },
  hide() {
    this.set('visible', false);
    const el = this.get('el');
    if (el) {
      el.setAttribute('visibility', 'hidden');
    }
    return this;
  },
  remove(destroy) {
    const el = this.get('el');
    if (destroy === undefined) {
      destroy = true;
    }

    if (this.get('parent')) {
      const parent = this.get('parent');
      const children = parent.get('children');
      Util.remove(children, this);
      el.parentNode.removeChild(el);
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
    this.__cfg = {};
    this.__attrs = null;
    this.removeEvent(); // 移除所有的事件
    this.set('destroyed', true);
  },
  _beforeSetZIndex(zIndex) {
    this.__cfg.zIndex = zIndex;

    if (!Util.isNil(this.get('parent'))) {
      this.get('parent').sort();
    }
    return zIndex;
  },
  _setAttrs(attrs) {
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
    const el = this.get('el');
    if (!el) {
      return {
        minX: 0,
        minY: 0,
        maxX: 0,
        maxY: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 0
      };
    }
    let bbox = el.getBBox();
    if (!el.parentNode || (bbox.width === 0 && bbox.height === 0)) {
      const node = el.cloneNode();
      node.innerHTML = el.innerHTML;
      node.setAttribute('visible', 'hidden');
      const svg = document.getElementsByTagName('svg')[0];
      svg.appendChild(node);
      bbox = node.getBBox();
      svg.removeChild(node);
    }
    bbox.minX = bbox.x;
    bbox.minY = bbox.y;
    bbox.maxX = bbox.x + bbox.width;
    bbox.maxY = bbox.y + bbox.height;
    return {
      minX: bbox.x,
      minY: bbox.y,
      maxX: bbox.x + bbox.width,
      maxY: bbox.y + bbox.height,
      width: bbox.width,
      height: bbox.height,
      x: bbox.x,
      y: bbox.y
    };
  }
});

module.exports = Element;
