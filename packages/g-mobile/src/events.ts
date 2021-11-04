import Hammer, { TouchInput } from '@antv/f6-hammerjs';
import { Event as GraphEvent } from '@antv/g-base';
import { ICanvas, IShape } from '@antv/g-base';
import { each, isParent } from './util/util';
import MiniCanvas from './canvas';
const CLICK_OFFSET = 40;
const LEFT_BTN_CODE = 0;
const DELEGATION_SPLIT = ':';

// 是否有委托事件监听
function hasDelegation(events, type) {
  for (const key in events) {
    if (events.hasOwnProperty(key) && key.indexOf(DELEGATION_SPLIT + type) >= 0) {
      return true;
    }
  }
  return false;
}

// 触发目标事件，目标只能是 shape 或 canvas
function emitTargetEvent(target, type, eventObj) {
  eventObj.name = type;
  eventObj.target = target;
  eventObj.currentTarget = target;
  eventObj.delegateTarget = target;
  target.emit(type, eventObj);
}

// 事件冒泡, enter 和 leave 需要对 fromShape 和 toShape 进行判同
function bubbleEvent(container, type, eventObj) {
  if (eventObj.bubbles) {
    let relativeShape;
    let isOverEvent = false;

    if (container.isCanvas() && isOverEvent) {
      return;
    }
    // 如果相关图形同当前图形在同一个容器内，不触发事件
    if (relativeShape && isParent(container, relativeShape)) {
      // 阻止继续向上冒泡
      eventObj.bubbles = false;
      return;
    }
    // 事件名称可能在委托过程中被修改，因此事件冒泡时需要重新设置事件名称
    eventObj.name = type;
    eventObj.currentTarget = container;
    eventObj.delegateTarget = container;
    container.emit(type, eventObj);
  }
}

class EventController {
  // 画布容器
  private canvas: ICanvas;
  // 手势管理
  private hammerRuntime: Hammer;

  // 正在被拖拽的图形
  private draggingShape: IShape = null;
  private dragging: boolean = false;
  // 当前鼠标/touch所在位置的图形
  private currentShape: IShape = null;
  private panstartShape: IShape = null;
  private panstartPoint = null;
  private panstartTimeStamp;

  constructor(cfg) {
    this.canvas = cfg.canvas;
    this._initEvent();
  }

  _initEvent() {
    this.hammerRuntime = new Hammer(
      {},
      {
        inputClass: TouchInput,
      }
    );

    this.hammerRuntime.add(new Hammer.Pan({ threshold: 0, pointers: 1 }));
    this.hammerRuntime.add(new Hammer.Swipe()).recognizeWith(this.hammerRuntime.get('pan'));
    //this.hammerRuntime.add(new Hammer.Rotate({ threshold: 0 })).recognizeWith(this.hammerRuntime.get('pan'));
    this.hammerRuntime.add(new Hammer.Pinch({ threshold: 0, pointers: 2 }));
    //.recognizeWith([this.hammerRuntime.get('pan'), this.hammerRuntime.get('rotate')]);
    this.hammerRuntime.add(new Hammer.Tap({ event: 'dbltap', taps: 2 }));
    this.hammerRuntime.add(new Hammer.Tap());
    this.hammerRuntime.add(new Hammer.Press({ time: 500 }));

    this.hammerRuntime.on('panstart panmove panend pancancel', (e) => {
      e.srcEvent.extra = e;

      const pointInfo = this._getPointInfo(e);
      const shape = this._getShape(pointInfo, e);

      // 结束拖拽
      if (e.type === 'panend' || e.type === 'pancancel') {
        this._onpanend(pointInfo, shape, e);
      }

      // 开始拖拽
      if (e.type === 'panstart') {
        // 兜底, hammer解析的事件可能缺失一次panend，所以做个兜底
        if (this.dragging) {
          this.draggingShape = null;
          this.dragging = false;
          this.panstartShape = null;
          this.panstartPoint = null;
        }
        this._onpanstart(pointInfo, shape, e);
      }

      // 拖拽中
      if (e.type === 'panmove') {
        this._onpanmove(pointInfo, shape, e);
      }

      this.currentShape = shape;
    });

    this.hammerRuntime.on('tap dbltap press swipe rotatestart rotatemove', (e) => {
      this._emitMobileEvent(e.type, e);
    });

    this.hammerRuntime.on('pinchstart pinchmove pinchend pinchcancel', (e) => {
      if (e.type === 'pinchend' || e.type === 'pinchcancel') {
        this._emitMobileEvent(e.type, e);
        return;
      }

      e.srcEvent.extra = {
        scale: e.scale,
      };
      this._emitMobileEvent(e.type, e);
    });
  }

  _emitMobileEvent(type, ev) {
    const pointInfo = this._getPointInfo(ev);
    const shape = this._getShape(pointInfo, ev);
    this._emitEvent(type, ev, pointInfo, shape);
  }

  _getEventObj(type, event, point, target, fromShape, toShape) {
    const eventObj = new GraphEvent(type, event);
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
  handleEvent = (ev) => {
    this.hammerRuntime.emit(`origin_input:${ev.type}`, ev);
  };

  // 根据点获取图形，提取成独立方法，便于后续优化
  _getShape(point, event: any) {
    const ev: Event = event.srcEvent;
    return this.canvas.getShape(point.x, point.y, ev);
  }
  // 获取事件的当前点的信息
  _getPointInfo(ev) {
    const canvas = this.canvas as MiniCanvas;

    const clientPoint = canvas.getClientByEvent(ev);
    const point = canvas.getPointByEvent(ev);
    return {
      x: point.x,
      y: point.y,
      clientX: clientPoint.x,
      clientY: clientPoint.y,
    };
  }

  // 触发事件
  _triggerEvent(type, ev) {
    const pointInfo = this._getPointInfo(ev);
    // 每次都获取图形有一定成本，后期可以考虑进行缓存策略
    const shape = this._getShape(pointInfo, ev);
    const method = this[`_on${type}`];
    if (method) {
      method.call(this, pointInfo, shape, ev);
    } else {
      const preShape = this.currentShape;
      // 如果进入、移出画布时存在图形，则要分别触发事件
      if (type === 'panstart' || type === 'dragenter') {
        this._emitEvent(type, ev, pointInfo, null, null, shape); // 先进入画布
        if (shape) {
          this._emitEvent(type, ev, pointInfo, shape, null, shape); // 再触发图形的事件
        }
        if (type === 'panstart' && this.draggingShape) {
          // 如果正在拖拽图形, 则触发 dragleave
          this._emitEvent('dragenter', ev, pointInfo, null);
        }
      } else if (type === 'panend' || type === 'dragleave') {
        if (preShape) {
          this._emitEvent(type, ev, pointInfo, preShape, preShape, null); // 先触发图形的事件
        }
        this._emitEvent(type, ev, pointInfo, null, preShape, null); // 再触发离开画布事件
        if (type === 'panend' && this.draggingShape) {
          this._emitEvent('dragleave', ev, pointInfo, null);
        }
      } else {
        this._emitEvent(type, ev, pointInfo, shape, null, null); // 一般事件中不需要考虑 from, to
      }
    }
  }

  // 记录下点击的位置、图形，便于拖拽事件、click 事件的判定
  _onpanstart(pointInfo, shape, event) {
    this.panstartShape = shape;
    this.panstartPoint = pointInfo;
    this.panstartTimeStamp = event.timeStamp;
    this._emitEvent('panstart', event, pointInfo, shape, null, null);
  }

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
      // TODO: 此处判断有问题，当 drag 图形时，也会触发一次 dragleave 事件，因为此时 toShape 为 null，这不是所期望的
      // 经过空白区域
      this._emitEvent('dragleave', event, pointInfo, fromShape, fromShape, toShape);
    }

    if (isCanvasEmit) {
      this._emitEvent('dragover', event, pointInfo, toShape);
    }
  }

  // drag 完成后，需要做一些清理工作
  _afterDrag(draggingShape, pointInfo, event) {
    if (draggingShape) {
      draggingShape.set('capture', true); // 恢复可以拾取
      this.draggingShape = null;
    }
    this.dragging = false;
    // drag 完成后，有可能 draggingShape 已经移动到了当前位置，所以不能直接取当前图形
    const shape = this._getShape(pointInfo, event);
    this.currentShape = shape;
  }
  // 按键抬起时，会终止拖拽、触发点击
  _onpanend(pointInfo, shape, event) {
    const draggingShape = this.draggingShape;
    if (this.dragging) {
      // 存在可以拖拽的图形，同时拖拽到其他图形上时触发 drag 事件
      if (draggingShape) {
        this._emitEvent('drop', event, pointInfo, shape);
      }
      this._emitEvent('dragend', event, pointInfo, draggingShape);
      this._afterDrag(draggingShape, pointInfo, event);
    }
    this._emitEvent('panend', event, pointInfo, shape);

    this.panstartShape = null;
    this.panstartPoint = null;
  }

  // 大量的图形事件，都通过 mousemove 模拟
  _onpanmove(pointInfo, shape, event) {
    const canvas = this.canvas;
    const preShape = this.currentShape;
    let draggingShape = this.draggingShape;
    // 正在拖拽时
    if (this.dragging) {
      // 正在拖拽中
      if (draggingShape) {
        // 如果拖拽了 shape 会触发 dragenter, dragleave, dragover 和 drag 事件
        this._emitDragoverEvents(event, pointInfo, preShape, shape, false);
      }
      // 如果存在 draggingShape 则会在 draggingShape 上触发 drag 事件，冒泡到 canvas 上
      // 否则在 canvas 上触发 drag 事件
      this._emitEvent('drag', event, pointInfo, draggingShape);
    } else {
      const panstartPoint = this.panstartPoint;
      if (panstartPoint) {
        // 当鼠标点击下去，同时移动时，进行 drag 判定
        const panstartShape = this.panstartShape;
        const now = event.timeStamp;
        const timeWindow = now - this.panstartTimeStamp;
        const dx = panstartPoint.clientX - pointInfo.clientX;
        const dy = panstartPoint.clientY - pointInfo.clientY;
        const dist = dx * dx + dy * dy;
        if (timeWindow > 120 || dist > CLICK_OFFSET) {
          if (panstartShape && panstartShape.get('draggable')) {
            // 设置了 draggable 的 shape 才能触发 drag 相关的事件
            draggingShape = this.panstartShape; // 拖动鼠标点下时的 shape
            draggingShape.set('capture', false); // 禁止继续拾取，否则无法进行 dragover,dragenter,dragleave,drop的判定
            this.draggingShape = draggingShape;
            this.dragging = true;
            this._emitEvent('dragstart', event, pointInfo, draggingShape);
            // 清理按下鼠标时缓存的值
            this.panstartShape = null;
            this.panstartPoint = null;
          } else if (!panstartShape && canvas.get('draggable')) {
            // 设置了 draggable 的 canvas 才能触发 drag 相关的事件
            this.dragging = true;
            this._emitEvent('dragstart', event, pointInfo, null);
            // 清理按下鼠标时缓存的值
            this.panstartShape = null;
            this.panstartPoint = null;
          } else {
            this._emitEvent('panmove', event, pointInfo, shape);
          }
        }
      }
    }

    this._emitEvent('panmove', event, pointInfo, shape);
  }

  // 触发事件
  _emitEvent(type, event, pointInfo, shape, fromShape?, toShape?) {
    const eventObj = this._getEventObj(type, event, pointInfo, shape, fromShape, toShape);
    // 存在 shape 触发，则进行冒泡处理
    if (shape) {
      eventObj.shape = shape;
      // 触发 shape 上的事件
      emitTargetEvent(shape, type, eventObj);
      let parent = shape.getParent();
      // 执行冒泡
      while (parent) {
        // 委托事件要先触发
        parent.emitDelegation(type, eventObj);
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
      // 直接触发 canvas 上的事件
      emitTargetEvent(canvas, type, eventObj);
    }
  }

  destroy() {
    // 清理缓存的对象
    this.canvas = null;
    this.currentShape = null;
    this.draggingShape = null;
    this.panstartPoint = null;
    this.panstartShape = null;
    this.panstartTimeStamp = null;
  }
}

export default EventController;
