const TABLE = document.createElement('table');
const TABLE_TR = document.createElement('tr');
const FRAGMENT_REG = /^\s*<(\w+|!)[^>]*>/;
const CONTAINERS = {
  'tr': document.createElement('tbody'),
  'tbody': TABLE,
  'thead': TABLE,
  'tfoot': TABLE,
  'td': TABLE_TR,
  'th': TABLE_TR,
  '*': document.createElement('div')
};

module.exports = {
  /**
   * 计算BoundingClientRect
   * @param  {HTMLElement} DOM 节点
   * @return {Object}  DOM 节点
   */
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
   * @param  {Object} DOM节点
   * @param  {String} name 样式名
   * @return {String} 属性值
   */
  getStyle(dom, name) {
    if (window.getComputedStyle) {
      return window.getComputedStyle(dom, null)[name];
    }
    return dom.currentStyle[name];
  },
  /**
   * 修改CSS
   * @param  {Object} DOM
   * @param  {Object} CSS键值对
   * @return {Object} DOM
   */
  modiCSS(dom, css) {
    for (let key in css) {
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
  /**
   * 获取屏幕像素比
   */
  getRatio() {
    return window.devicePixelRatio ? window.devicePixelRatio : 2;
  },
  /**
   * 获取宽度
   * @param  {HTMLElement} el  dom节点
   * @return {Number} 宽度
   */
  getWidth(el) {
    let width = Util.getStyle(el, 'width');
    if (width === 'auto') {
      width = el.offsetWidth;
    }
    return parseFloat(width);
  },
  /**
   * 获取高度
   * @param  {HTMLElement} el  dom节点
   * @return {Number} 高度
   */
  getHeight(el) {
    let height = Util.getStyle(el, 'height');
    if (height === 'auto') {
      height = el.offsetHeight;
    }
    return parseFloat(height);
  },
  /**
   * 获取外层高度
   * @param  {HTMLElement} el  dom节点
   * @return {Number} 高度
   */
  getOuterHeight(el) {
    const height = Util.getHeight(el);
    const bTop = parseFloat(Util.getStyle(el, 'borderTopWidth')) || 0;
    const pTop = parseFloat(Util.getStyle(el, 'paddingTop'));
    const pBottom = parseFloat(Util.getStyle(el, 'paddingBottom'));
    const bBottom = parseFloat(Util.getStyle(el, 'borderBottomWidth')) || 0;
    return height + bTop + bBottom + pTop + pBottom;
  },
  /**
   * TODO: 应该移除的
   * 添加时间监听器
   * @param  {object} DOM对象
   * @param  {Object} 事件名
   * @param  {funtion} 回调函数
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
  },
  cancelAnimationFrame(id) {
    const method = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || function(id) {
      return clearTimeout(id);
    };
    return method(id);
  }
};
