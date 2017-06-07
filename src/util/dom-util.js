var table = document.createElement('table');
var tableRow = document.createElement('tr');
var FRAGMENTRE = /^\s*<(\w+|!)[^>]*>/;
var CONTAINERS = {
  'tr': document.createElement('tbody'),
  'tbody': table,
  'thead': table,
  'tfoot': table,
  'td': tableRow,
  'th': tableRow,
  '*': document.createElement('div')
};

module.exports = {
  /**
   * 计算BoundingClientRect
   * @param  {HTMLElement} DOM 节点
   * @return {Object}  DOM 节点
   */
  getBoundingClientRect: function(node) {
    var rect = node.getBoundingClientRect();
    var top = document.documentElement.clientTop;
    var left = document.documentElement.clientLeft;
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
  getStyle: function(DOM, name) {
    if (window.getComputedStyle) {
      return window.getComputedStyle(DOM, null)[name];
    }
    return DOM.currentStyle[name];
  },
  /**
   * 修改CSS
   * @param  {Object} DOM
   * @param  {Object} CSS键值对
   * @return {Object} DOM
   */
  modiCSS: function(DOM, CSS) {
    for (var key in CSS) {
      if (CSS.hasOwnProperty(key)) {
        DOM.style[key] = CSS[key];
      }
    }
    return DOM;
  },
  /**
   * 创建DOM 节点
   * @param  {String} str Dom 字符串
   * @return {HTMLElement}  DOM 节点
   */
  createDom: function(str) {
    var name = FRAGMENTRE.test(str) && RegExp.$1;
    if (!(name in CONTAINERS)) {
      name = '*';
    }
    var container = CONTAINERS[name];
    str = str.replace(/(^\s*)|(\s*$)/g, '');
    container.innerHTML = '' + str;
    return container.childNodes[0];
  },
  /**
   * TODO: 应该移除的
   * 添加时间监听器
   * @param  {object} DOM对象
   * @param  {Object} 事件名
   * @param  {funtion} 回调函数
   * @return {Object} 返回对象
   */
  addEventListener: function(target, eventType, callback) {
    if (target.addEventListener) {
      target.addEventListener(eventType, callback, false);
      return {
        remove: function() {
          target.removeEventListener(eventType, callback, false);
        }
      };
    } else if (target.attachEvent) {
      target.attachEvent('on' + eventType, callback);
      return {
        remove: function() {
          target.detachEvent('on' + eventType, callback);
        }
      };
    }
  }
};
