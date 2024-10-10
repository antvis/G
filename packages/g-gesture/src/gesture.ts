import type {
  DisplayObject,
  FederatedPointerEvent,
  PointLike as Point,
} from '@antv/g-lite';
import EventEmitter from 'eventemitter3';

const clock =
  typeof performance === 'object' && performance.now ? performance : Date;

const PRESS_DELAY = 250;

// 计算滑动的方向
const calcDirection = (start: Point, end: Point) => {
  const xDistance = end.x - start.x;
  const yDistance = end.y - start.y;
  // x 的距离大于y 说明是横向，否则就是纵向
  if (Math.abs(xDistance) > Math.abs(yDistance)) {
    return xDistance > 0 ? 'right' : 'left';
  }
  return yDistance > 0 ? 'down' : 'up';
};

// 计算2点之间的距离
const calcDistance = (point1: Point, point2: Point) => {
  const xDistance = Math.abs(point2.x - point1.x);
  const yDistance = Math.abs(point2.y - point1.y);
  return Math.sqrt(xDistance * xDistance + yDistance * yDistance);
};

const getCenter = (point1: Point, point2: Point) => {
  const x = point1.x + (point2.x - point1.x) / 2;
  const y = point1.y + (point2.y - point1.y) / 2;
  return { x, y };
};

type Direction = 'none' | 'left' | 'right' | 'down' | 'up';

export interface GestureEvent extends FederatedPointerEvent {
  points: Point[];
  direction: Direction;
  deltaX: number;
  deltaY: number;
  zoom: number;
  center: Point;
  velocity: number;
}

interface EmitEventObject {
  type: string;
  ev: GestureEvent;
}

interface evCacheObject {
  pointerId: number;
  x: number;
  y: number;
  ev: GestureEvent;
}
class Gesture extends EventEmitter {
  private el: DisplayObject;
  private evCache: evCacheObject[] = [];
  private startTime: number;
  private pressTimeout: number;
  private startPoints: Point[] = [];
  // 用来记录当前触发的事件
  private processEvent: Record<string, boolean> = {};
  private startDistance: number;
  private center: Point;
  private eventType: string;
  private direction: Direction;
  private lastMoveTime: number;
  private prevMovePoint: Point;
  private prevMoveTime: number;
  private lastMovePoint: Point;
  private throttleTimer = 0;
  private emitThrottles: EmitEventObject[] = [];

  constructor(el: DisplayObject) {
    super();
    this.el = el;
    this._initEvent();
  }

  private _initEvent() {
    const { el } = this;

    el.addEventListener('pointerdown', this._start);
    el.addEventListener('pointermove', this._move);
    el.addEventListener('pointerup', this._end);
    el.addEventListener('pointercancel', this._cancel);
    el.addEventListener('pointerupoutside', this._end);
  }

  private _start = (ev?: GestureEvent) => {
    // 每次触点开始都重置事件
    this.reset();

    // 记录touch start 的时间
    this.startTime = clock.now();

    const { evCache, startPoints } = this;
    if (ev) {
      const { pointerId, x, y } = ev;
      evCache.push({
        pointerId,
        x,
        y,
        ev,
      });
    }
    // 重置 startPoints
    startPoints.length = evCache.length;
    for (let i = 0; i < evCache.length; i++) {
      const { x, y } = evCache[i];
      const point = { x, y };
      startPoints[i] = point;
    }

    // 单指事件
    if (startPoints.length === 1) {
      const event = evCache[0].ev;
      // 如果touchstart后停顿250ms, 则也触发press事件
      // @ts-ignore
      this.pressTimeout = setTimeout(() => {
        // 这里固定触发press事件
        const eventType = 'press';
        const direction = 'none';
        event.direction = direction;
        event.deltaX = 0;
        event.deltaY = 0;
        event.points = startPoints;
        this.emitStart(eventType, event);
        this.emit(eventType, event);
        this.eventType = eventType;
        this.direction = direction;
      }, PRESS_DELAY);
      return;
    }

    // 目前只处理双指
    this.startDistance = calcDistance(startPoints[0], startPoints[1]);
    this.center = getCenter(startPoints[0], startPoints[1]);
  };

  private _move = (ev: GestureEvent) => {
    this.clearPressTimeout();

    const { startPoints, evCache } = this;
    if (!startPoints.length) return;

    const { x, y, pointerId } = ev;

    let isTriggerStart = false;
    // Find this event in the cache and update its record with this event
    for (let i = 0, len = evCache.length; i < len; i++) {
      if (pointerId === evCache[i].pointerId) {
        evCache[i] = {
          pointerId,
          x,
          y,
          ev,
        };
        isTriggerStart = true;
        break;
      }
    }

    // 无触发start事件 需保留startPoints重新触发start
    if (!isTriggerStart) {
      const point = { x, y };
      startPoints.push(point);
      evCache.push({
        pointerId,
        x,
        y,
        ev,
      });
      // 目前只处理双指
      this.startDistance = calcDistance(startPoints[0], startPoints[1]);
      this.center = getCenter(startPoints[0], startPoints[1]);
    }

    const point = { x, y };
    const points = evCache.map((ev) => {
      return { x: ev.x, y: ev.y };
    });

    // 记录最后2次move的时间和坐标，为了给swipe事件用
    const now = clock.now();
    this.prevMoveTime = this.lastMoveTime;
    this.prevMovePoint = this.lastMovePoint;
    this.lastMoveTime = now;
    this.lastMovePoint = point;

    if (startPoints.length === 1) {
      const startPoint = startPoints[0];
      const deltaX = x - startPoint.x;
      const deltaY = y - startPoint.y;
      const direction = this.direction || calcDirection(startPoint, point);
      this.direction = direction;
      // 获取press或者pan的事件类型
      // press 按住滑动, pan表示平移
      // 如果start后立刻move，则触发pan, 如果有停顿，则触发press
      const eventType = this.getEventType(point);
      ev.direction = direction;
      ev.deltaX = deltaX;
      ev.deltaY = deltaY;
      ev.points = points;
      this.emitStart(eventType, ev);
      this.emit(eventType, ev);
      return;
    }

    // 多指触控
    const { startDistance } = this;
    const currentDistance = calcDistance(points[0], points[1]);

    // 缩放比例
    ev.zoom = currentDistance / startDistance;
    ev.center = this.center;
    ev.points = points;
    // 触发缩放事件
    this.emitStart('pinch', ev);
    // touch 多指会被拆成多个手指的 move, 会触发多次 move，所以这里需要做节流
    this._throttleEmit('pinch', ev);
  };

  private _end = (ev: GestureEvent) => {
    const { evCache, startPoints } = this;
    const points = evCache.map((ev) => {
      return { x: ev.x, y: ev.y };
    });
    ev.points = points;
    this.emitEnd(ev);

    // 单指
    if (evCache.length === 1) {
      // swipe事件处理, 在end之后触发
      const now = clock.now();
      const { lastMoveTime } = this;
      // 做这个判断是为了最后一次touchmove后到end前，是否还有一个停顿的过程
      // 100 是拍的一个值，理论这个值会很短，一般不卡顿的话在10ms以内
      if (now - lastMoveTime < 100) {
        const prevMoveTime = this.prevMoveTime || this.startTime;
        const intervalTime = lastMoveTime - prevMoveTime;
        // 时间间隔一定要大于0, 否则计算没意义
        if (intervalTime > 0) {
          const prevMovePoint = this.prevMovePoint || startPoints[0];
          const lastMovePoint = this.lastMovePoint || startPoints[0];
          // move速率
          const velocity =
            calcDistance(prevMovePoint, lastMovePoint) / intervalTime;
          // 0.3 是参考hammerjs的设置
          if (velocity > 0.3) {
            ev.velocity = velocity;
            ev.direction = calcDirection(prevMovePoint, lastMovePoint);
            this.emit('swipe', ev);
          }
        }
      }
    }

    // remove event from cache
    for (let i = 0, len = evCache.length; i < len; i++) {
      if (evCache[i].pointerId === ev.pointerId) {
        evCache.splice(i, 1);
        startPoints.splice(i, 1);
        break;
      }
    }

    this.reset();

    // 多指离开 1 指后，重新触发一次start
    if (evCache.length > 0) {
      this._start();
    }
  };

  private _cancel = (ev: GestureEvent) => {
    const { evCache } = this;
    const points = evCache.map((ev) => {
      return { x: ev.x, y: ev.y };
    });
    ev.points = points;
    this.emitEnd(ev);
    this.evCache = [];
    this.reset();
  };

  private getEventType(point: Point) {
    const { eventType, startTime, startPoints } = this;
    if (eventType) {
      return eventType;
    }
    let type;
    // @ts-ignore
    const panEventListeners = this._events.pan;
    // 如果没有pan事件的监听，默认都是press
    if (!panEventListeners) {
      type = 'press';
    } else {
      // 如果有pan事件的处理，press则需要停顿250ms, 且移动距离小于10
      const now = clock.now();
      if (
        now - startTime > PRESS_DELAY &&
        calcDistance(startPoints[0], point) < 10
      ) {
        type = 'press';
      } else {
        type = 'pan';
      }
    }
    this.eventType = type;
    return type;
  }

  private enable(eventType: string) {
    this.processEvent[eventType] = true;
  }

  // 是否进行中的事件
  private isProcess(eventType: string) {
    return this.processEvent[eventType];
  }

  // 触发start事件
  private emitStart(type: string, ev: GestureEvent) {
    if (this.isProcess(type)) {
      return;
    }
    this.enable(type);
    this.emit(`${type}start`, ev);
  }

  // 触发事件
  private _throttleEmit(type: string, ev: GestureEvent) {
    // 主要是节流处理
    this.pushEvent(type, ev);
    const { el, throttleTimer, emitThrottles, processEvent } = this;
    if (throttleTimer) {
      return;
    }

    // @ts-ignore
    const global = el.ownerDocument?.defaultView || el.document?.defaultView;
    this.throttleTimer = global.requestAnimationFrame(() => {
      for (let i = 0, len = emitThrottles.length; i < len; i++) {
        const { type, ev } = emitThrottles[i];
        if (processEvent[type]) {
          this.emit(type, ev);
        }
      }
      // 清空
      this.throttleTimer = 0;
      this.emitThrottles.length = 0;
    });
  }

  // 触发end事件
  private emitEnd(ev: GestureEvent) {
    const { processEvent } = this;
    Object.keys(processEvent).forEach((type) => {
      this.emit(`${type}end`, ev);
      delete processEvent[type];
    });
  }

  private pushEvent(type: string, ev: GestureEvent) {
    const { emitThrottles } = this;
    const newEvent = { type, ev };
    for (let i = 0, len = emitThrottles.length; i < len; i++) {
      if (emitThrottles[i].type === type) {
        emitThrottles.splice(i, 1, newEvent);
        return;
      }
    }
    emitThrottles.push(newEvent);
  }

  private clearPressTimeout() {
    if (this.pressTimeout) {
      clearTimeout(this.pressTimeout);
      this.pressTimeout = null;
    }
  }

  private reset() {
    this.clearPressTimeout();
    this.startTime = 0;
    this.startDistance = 0;
    this.direction = null;
    this.eventType = null;
    this.prevMoveTime = 0;
    this.prevMovePoint = null;
    this.lastMoveTime = 0;
    this.lastMovePoint = null;
  }
}

export default Gesture;
