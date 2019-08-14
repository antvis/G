/**
 * @fileoverview 事件处理器
 * @author dxq613@gmail.com
 */
import GraphEvent from './event';
import { ICanvas, IShape, IBase } from '../interfaces';
import { each } from '../util/util';
const TIME_INTERVAL = 120; // 判断拖拽和点击
const CLICK_OFFSET = 40;
const DELEGATION_SPLIT = ':';

const EVENTS = [
  'mousedown',
  'mouseup',
  'dblclick',
  'mouseout',
  'mouseover',
  'mousemove',
  'mouseleave', // 等同于 mouseout
  'mouseenter', // 等同于 mouseenter
  'touchstart',
  'touchmove',
  'touchend',
  'dragenter',
  'dragover',
  'dragleave',
  'drop',
  'contextmenu',
];

// 是否是元素的子元素
function isParent(container, shape) {
  // 所有 shape 都是 canvas 的子元素
  if (container.isCanvas()) {
    return true;
  }
  let parent = shape.getParent();
  let isParent = false;
  while (parent) {
    if (parent === container) {
      isParent = true;
      break;
    }
    parent = parent.getParent();
  }
  return isParent;
}

// 触摸事件的 clientX，clientY 获取有一定差异
function getClientPoint(event) {
  let clientInfo = event;
  if (event.touches) {
    if (event.type === 'touchend') {
      clientInfo = event.changedTouches[0];
    } else {
      clientInfo = event.touches[0];
    }
  }
  return {
    clientX: clientInfo.clientX,
    clientY: clientInfo.clientY,
  };
}

// 是否有委托事件监听
function hasDelegation(events, type) {
  for (const key in events) {
    if (events.hasOwnProperty(key) && key.indexOf(DELEGATION_SPLIT + type) >= 0) {
      return true;
    }
  }
  return false;
}

// 触发委托事件
function emitDelegation(container, type, eventObj) {
  const paths = eventObj.propagationPath;
  const events = container.events;
  // 至少有一个对象
  for (let i = 1; i < paths.length; i++) {
    const group = paths[i];
    // 暂定跟 name 绑定
    const name = group.get('name');
    if (name) {
      const eventName = name + DELEGATION_SPLIT + type;
      if (events[eventName]) {
        eventObj.delegateTarget = container;
        eventObj.currentTarget = group;
        container.emit(eventName, eventObj);
      }
    }
  }
}

// 事件冒泡, enter 和 leave 需要对 fromShape 和 toShape 进行判同
function bubbleEvent(container, type, eventObj) {
  if (eventObj.bubbles) {
    let relativeShape;
    let isOverEvent = false;
    if (type === 'mouseenter' || type === 'dragenter') {
      relativeShape = eventObj.fromShape;
      isOverEvent = true;
    } else if (type === 'mouseleave' || type === 'dragleave') {
      isOverEvent = true;
      relativeShape = eventObj.toShape;
    }
    // canvas 上的 mouseenter， mouseleave 事件，仅当进入或者移出 canvas 时触发
    if (container.isCanvas() && isOverEvent) {
      return;
    }
    // 如果相关图形同当前图形在同一个容器内，不触发事件
    if (relativeShape && isParent(container, relativeShape)) {
      // 阻止继续向上冒泡
      eventObj.bubbles = false;
      return;
    }
    // 绑定事件的对象
    eventObj.currentTarget = container;
    container.emit(type, eventObj);
  }
}

class EventController {
  // 画布容器
  private canvas: ICanvas;
  // 正在被拖拽的图形
  private draggingShape: IShape = null;
  // 当前鼠标/touch所在位置的图形
  private currentShape: IShape = null;
  private mousedownShape: IShape = null;
  private mousedownPoint = null;
  private mousedownTimeStamp;

  constructor(cfg) {
    this.canvas = cfg.canvas;
  }

  init() {
    this._bindEvents();
  }

  // 注册事件
  _bindEvents() {
    const el = this.canvas.get('el');
    each(EVENTS, (eventName) => {
      el.addEventListener(eventName, this._eventCallback);
    });
  }

  _getEventObj(type, event, point, target, fromShape, toShape) {
    const eventObj = new GraphEvent(type, event);
    // eventObj.target = target;
    eventObj.fromShape = fromShape;
    eventObj.toShape = toShape;
    eventObj.x = point.x;
    eventObj.y = point.y;
    eventObj.clientX = point.clientX;
    eventObj.clientY = point.clientY;

    eventObj.propagationPath.push(target);
    // 事件的x,y应该是基于画布左上角的，与canvas的matrix无关
    return eventObj;
  }

  // 统一处理所有的回调
  _eventCallback = (ev) => {
    const type = ev.type;
    this._triggerEvent(type, ev);
  };

  // 根据点获取图形，提取成独立方法，便于后续优化
  _getShapeByPoint(point) {
    return this.canvas.getShape(point.x, point.y);
  }

  // 触发事件
  _triggerEvent(type, ev) {
    const canvas = this.canvas;
    const clientPoint = getClientPoint(ev);
    const point = canvas.getPointByClient(clientPoint.clientX, clientPoint.clientY);
    // 每次都获取图形有一定成本，后期可以考虑进行缓存策略
    const shape = this._getShapeByPoint(point);
    const pointInfo = {
      x: point.x,
      y: point.y,
      clientX: clientPoint.clientX,
      clientY: clientPoint.clientY,
    };
    const method = this[`_on${type}`];
    if (method) {
      method.call(this, pointInfo, shape, event);
    } else {
      // 如果进入、移出画布时存在图形，则要分别出发事件
      if (shape) {
        if (type === 'mouseenter' || type === 'dragenter') {
          this._emitEvent(type, event, pointInfo, null, null, shape); // 先进入画布
          this._emitEvent(type, event, pointInfo, shape, null, shape); // 再触发图形的事件
        } else if (type === 'mouseleave' || type === 'dragleave') {
          this._emitEvent(type, event, pointInfo, shape, shape, null); // 先触发图形的事件
          this._emitEvent(type, event, pointInfo, null, shape, null); // 再触发离开画布事件
        } else {
          this._emitEvent(type, event, pointInfo, shape, null, null); // 一般事件中不需要考虑 from, to
        }
      } else {
        this._emitEvent(type, event, pointInfo, shape, null, null); // 一般事件中不需要考虑 from, to
      }
    }
    this.currentShape = shape;
  }
  // 记录下点击的位置、图形，便于拖拽事件、click 事件的判定
  _onmousedown(pointInfo, shape, event) {
    this.mousedownShape = shape;
    this.mousedownPoint = pointInfo;
    this.mousedownTimeStamp = event.timeStamp;
    this._emitEvent('mousedown', event, pointInfo, shape, null, null); // mousedown 不考虑fromShape, toShape
  }

  // mouseleave 和 mouseenter 都是成对存在的
  // mouseenter 和 mouseover 同时触发
  _emitMouseoverEvents(event, pointInfo, fromShape, toShape) {
    if (fromShape !== toShape) {
      if (fromShape) {
        this._emitEvent('mouseout', event, pointInfo, fromShape, fromShape, toShape);
        this._emitEvent('mouseleave', event, pointInfo, fromShape, fromShape, toShape);
      }
      if (toShape) {
        this._emitEvent('mouseover', event, pointInfo, toShape, fromShape, toShape);
        this._emitEvent('mouseenter', event, pointInfo, toShape, fromShape, toShape);
      }
    }
  }
  // dragover 不等同于 mouseover，而等同于 mousemove
  _emitDragoverEvents(event, pointInfo, fromShape, toShape, isCanvasEmit) {
    if (toShape) {
      if (toShape !== fromShape) {
        if (fromShape) {
          this._emitEvent('dragleave', event, pointInfo, fromShape, fromShape, toShape);
        }
        this._emitEvent('dragenter', event, pointInfo, toShape, fromShape, toShape);
      }
      if (!isCanvasEmit) {
        this._emitEvent('dragover', event, pointInfo, toShape);
      }
    } else if (fromShape) {
      // 经过空白区域
      this._emitEvent('dragleave', event, pointInfo, fromShape, fromShape, toShape);
    }

    if (isCanvasEmit) {
      this._emitEvent('dragover', event, pointInfo, toShape);
    }
  }

  // drag 完成后，需要做一些清理工作
  _afterDrag(draggingShape, pointInfo, event) {
    draggingShape.set('capture', true); // 恢复可以拾取
    this.draggingShape = null;
    // drag 完成后，有可能 draggingShape 已经移动到了当前位置，所以不能直接取当前图形
    const shape = this._getShapeByPoint(pointInfo);
    // 拖拽完成后，进行 enter，leave 的判定
    if (shape !== draggingShape) {
      this._emitMouseoverEvents(event, pointInfo, draggingShape, shape);
    }
    this.currentShape = shape; // 更新当前 shape，如果不处理当前图形的 mouseleave 事件可能会出问题
  }
  // 按键抬起时，会终止拖拽、触发点击
  _onmouseup(pointInfo, shape, event) {
    const draggingShape = this.draggingShape;
    if (draggingShape) {
      if (shape) {
        this._emitEvent('drop', event, pointInfo, shape);
      }
      this._emitEvent('dragend', event, pointInfo, draggingShape);
      this._afterDrag(draggingShape, pointInfo, event);
    } else {
      this._emitEvent('mouseup', event, pointInfo, shape); // 先触发 mouseup 再触发 click
      if (shape === this.mousedownShape) {
        this._emitEvent('click', event, pointInfo, shape);
      }
      this.mousedownShape = null;
      this.mousedownPoint = null;
    }
  }
  // 当触发浏览器的 dragover 事件时，不会再触发mousemove ，所以这时候的 dragenter, dragleave 事件需要重新处理
  _ondragover(pointInfo, shape, event) {
    const preShape = this.currentShape;
    this._emitDragoverEvents(event, pointInfo, preShape, shape, true);
  }

  // 大量的图形事件，都通过 mousemove 模拟
  _onmousemove(pointInfo, shape, event) {
    const preShape = this.currentShape;
    let draggingShape = this.draggingShape;
    // 正在拖拽时会触发 dragenter, dragleave, dragover 和 drag 事件
    if (draggingShape) {
      this._emitDragoverEvents(event, pointInfo, preShape, shape, false);
      this._emitEvent('drag', event, pointInfo, draggingShape);
    } else {
      const mousedownShape = this.mousedownShape;
      // 只有允许 dragable 的元素才被拖拽
      if (mousedownShape && mousedownShape.get('draggable')) {
        const mousedownPoint = this.mousedownPoint;
        const now = event.timeStamp;
        const timeWindow = now - this.mousedownTimeStamp;
        const dx = mousedownPoint.clientX - pointInfo.clientX;
        const dy = mousedownPoint.clientY - pointInfo.clientY;
        const dist = dx * dx + dy * dy;
        if (timeWindow > 120 || dist > CLICK_OFFSET) {
          draggingShape = this.mousedownShape; // 拖动鼠标点下时的 shape
          draggingShape.set('capture', false); // 禁止继续拾取，否则无法进行 dragover,dragenter,dragleave,drop的判定
          this.mousedownShape = null;
          this.draggingShape = draggingShape;
          this._emitEvent('dragstart', event, pointInfo, draggingShape);
        } else {
          this._emitEvent('mousemove', event, pointInfo, shape);
        }
      } else {
        this._emitMouseoverEvents(event, pointInfo, preShape, shape);
        // 始终触发移动
        this._emitEvent('mousemove', event, pointInfo, shape);
      }
    }
  }

  // 清理事件
  _clearEvents() {
    const el = this.canvas.get('el');
    each(EVENTS, (eventName) => {
      el.removeEventListener(eventName, this._eventCallback);
    });
  }

  // 触发事件
  _emitEvent(type, event, pointInfo, shape, fromShape?, toShape?) {
    const eventObj = this._getEventObj(type, event, pointInfo, shape, fromShape, toShape);
    // 存在 shape 触发，则进行冒泡处理
    if (shape) {
      eventObj.target = shape;
      eventObj.shape = shape;
      shape.emit(type, eventObj);
      let parent = shape.getParent();
      // 执行冒泡
      while (parent) {
        // 委托事件要先触发
        emitDelegation(parent, type, eventObj);
        // 事件冒泡停止，不能妨碍委托事件
        if (!eventObj.propagationStopped) {
          bubbleEvent(parent, type, eventObj);
        }
        eventObj.propagationPath.push(parent);
        parent = parent.getParent();
      }
    } else {
      // 如果没有 shape 直接在 canvas 上触发
      const canvas = this.canvas;
      eventObj.target = canvas;
      canvas.emit(type, eventObj);
    }
  }

  destroy() {
    // 清理事件
    this._clearEvents();
    // 清理缓存的对象
    this.canvas = null;
    this.currentShape = null;
    this.draggingShape = null;
    this.mousedownPoint = null;
    this.mousedownShape = null;
    this.mousedownTimeStamp = null;
  }
}

export default EventController;
