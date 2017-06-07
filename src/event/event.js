/**
 * @fileOverview 事件基类
 # @author hankaiai@126.com 韩凯
 * @ignore
 */

'use strict';

var Util = require('@ali/g-util');
var Event = function(type, event, bubbles, cancelable) {
  this.type = type; // 事件类型
  this.target = null; // 目标
  this.currentTarget = null; // 当前目标
  this.bubbles = bubbles; // 冒泡
  this.cancelable = cancelable; // 是否能够阻止
  this.timeStamp = (new Date()).getTime(); // 时间戳
  this.defaultPrevented = false; // 阻止默认
  this.propagationStopped = false; // 阻止冒泡
  this.removed = false; // 是否被移除
  this.event = event; // 触发的原生事件
};


Util.augment(Event, {
  preventDefault: function() {
    this.defaultPrevented = this.cancelable && true;
  },
  stopPropagation: function() {
    this.propagationStopped = true;
  },
  remove: function() {
    this.remove = true;
  },
  clone: function() {
    return Util.clone(this);
  },
  toString: function() {
    return '[Event (type=' + this.type + ')]';
  }
});

module.exports = Event;
