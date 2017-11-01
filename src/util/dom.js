const TABLE = document.createElement('table');
const TABLE_TR = document.createElement('tr');
const FRAGMENT_REG = /^\s*<(\w+|!)[^>]*>/;
const CONTAINERS = {
  tr: document.createElement('tbody'),
  tbody: TABLE,
  thead: TABLE,
  tfoot: TABLE,
  td: TABLE_TR,
  th: TABLE_TR,
  '*': document.createElement('div')
};

module.exports = {
  getBoundingClientRect(node) {
    const rect = node.getBoundingClientRect();
    const top = document.documentElement.clientTop;
    const left = document.documentElement.clientLeft;
    return {
      top: rect.top - top,
      bottom: rect.bottom - top,
      left: rect.left - left,
      right: rect.right - left
    };
  },
  /**
   * 获取样式
   * @param  {Object} dom DOM节点
   * @param  {String} name 样式名
   * @return {String} 属性值
   */
  getStyle(dom, name) {
    if (window.getComputedStyle) {
      return window.getComputedStyle(dom, null)[name];
    }
    return dom.currentStyle[name];
  },
  modifyCSS(dom, css) {
    for (const key in css) {
      if (css.hasOwnProperty(key)) {
        dom.style[key] = css[key];
      }
    }
    return dom;
  },
  /**
   * 创建DOM 节点
   * @param  {String} str Dom 字符串
   * @return {HTMLElement}  DOM 节点
   */
  createDom(str) {
    let name = FRAGMENT_REG.test(str) && RegExp.$1;
    if (!(name in CONTAINERS)) {
      name = '*';
    }
    const container = CONTAINERS[name];
    str = str.replace(/(^\s*)|(\s*$)/g, '');
    container.innerHTML = '' + str;
    return container.childNodes[0];
  },
  getRatio() {
    return window.devicePixelRatio ? window.devicePixelRatio : 2;
  },
  /**
   * 获取宽度
   * @param  {HTMLElement} el  dom节点
   * @return {Number} 宽度
   */
  getWidth(el) {
    let width = this.getStyle(el, 'width');
    if (width === 'auto') {
      width = el.offsetWidth;
    }
    return parseFloat(width);
  },
  /**
   * 获取高度
   * @param  {HTMLElement} el dom节点
   * @return {Number} 高度
   */
  getHeight(el) {
    let height = this.getStyle(el, 'height');
    if (height === 'auto') {
      height = el.offsetHeight;
    }
    return parseFloat(height);
  },
  /**
   * 获取外层高度
   * @param  {HTMLElement} el dom节点
   * @return {Number} 高度
   */
  getOuterHeight(el) {
    const height = this.getHeight(el);
    const bTop = parseFloat(this.getStyle(el, 'borderTopWidth')) || 0;
    const pTop = parseFloat(this.getStyle(el, 'paddingTop'));
    const pBottom = parseFloat(this.getStyle(el, 'paddingBottom'));
    const bBottom = parseFloat(this.getStyle(el, 'borderBottomWidth')) || 0;
    return height + bTop + bBottom + pTop + pBottom;
  },
  /**
   * 获取外层宽度
   * @param  {HTMLElement} el dom节点
   * @return {Number} 宽度
   */
  getOuterWidth(el) {
    const width = this.getWidth(el);
    const bLeft = parseFloat(this.getStyle(el, 'borderLeftWidth')) || 0;
    const pLeft = parseFloat(this.getStyle(el, 'paddingLeft'));
    const pRight = parseFloat(this.getStyle(el, 'paddingRight'));
    const bRight = parseFloat(this.getStyle(el, 'borderRightWidth')) || 0;
    return width + bLeft + bRight + pLeft + pRight;
  },
  /**
   * 添加事件监听器
   * @param  {Object} target DOM对象
   * @param  {String} eventType 事件名
   * @param  {Funtion} callback 回调函数
   * @return {Object} 返回对象
   */
  addEventListener(target, eventType, callback) {
    if (target.addEventListener) {
      target.addEventListener(eventType, callback, false);
      return {
        remove() {
          target.removeEventListener(eventType, callback, false);
        }
      };
    } else if (target.attachEvent) {
      target.attachEvent('on' + eventType, callback);
      return {
        remove() {
          target.detachEvent('on' + eventType, callback);
        }
      };
    }
  },
  requestAnimationFrame(fn) {
    const method = window.requestAnimationFrame || window.webkitRequestAnimationFrame || function(fn) {
      return setTimeout(fn, 16);
    };

    return method(fn);
  }
};
