import type {
  ICanvas,
  IDocument,
  IEventTarget,
  DisplayObject,
  RenderingPlugin,
  RenderingPluginContext,
  PointLike as Point,
} from '@antv/g-lite';
import type {
  GestureEvent,
  Direction,
  evCacheObject,
  EmitEventObject,
  GesturePluginOptions,
} from './interfaces';
import { calcDirection, calcDistance, clock, getCenter } from './util';

const PRESS_DELAY = 250;

export class GesturePlugin implements RenderingPlugin {
  static tag = 'Gesture';

  private canvas: ICanvas;

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
  private movingTarget: IEventTarget;
  private isPanListenerInPath: boolean;

  constructor(private options: GesturePluginOptions) {}

  apply(context: RenderingPluginContext) {
    const { renderingService, renderingContext } = context;
    const document = renderingContext.root.ownerDocument;
    const canvas = document.defaultView;
    this.canvas = canvas;

    const getGestureEventTarget = (target: DisplayObject) => {
      const isDocument = (target as unknown as IDocument) === document;

      return isDocument && this.options.isDocumentGestureEnabled
        ? document
        : target;
    };

    const handlePointermove = (ev: GestureEvent) => {
      const target = getGestureEventTarget(ev.target as DisplayObject);
      target && this._move(ev, target);
    };
    const handlePointerdown = (ev: GestureEvent) => {
      const target = getGestureEventTarget(ev.target as DisplayObject);
      target && this._start(ev, target);
    };
    const handlePointerup = (ev: GestureEvent) => {
      const target = getGestureEventTarget(ev.target as DisplayObject);
      target && this._end(ev, target);
    };
    const handlePointercancel = (ev: GestureEvent) => {
      const target = getGestureEventTarget(ev.target as DisplayObject);
      target && this._cancel(ev, target);
    };
    const handlePointercanceloutside = (ev: GestureEvent) => {
      const target = getGestureEventTarget(ev.target as DisplayObject);
      target && this._end(ev, target);
    };

    renderingService.hooks.init.tap(GesturePlugin.tag, () => {
      canvas.addEventListener('pointermove', handlePointermove);
      canvas.addEventListener('pointerdown', handlePointerdown);
      canvas.addEventListener('pointerup', handlePointerup);
      canvas.addEventListener('pointercancel', handlePointercancel);
      canvas.addEventListener('pointerupoutside', handlePointercanceloutside);
    });

    renderingService.hooks.destroy.tap(GesturePlugin.tag, () => {
      canvas.removeEventListener('pointermove', handlePointermove);
      canvas.removeEventListener('pointerdown', handlePointerdown);
      canvas.removeEventListener('pointerup', handlePointerup);
      canvas.removeEventListener('pointercancel', handlePointercancel);
      canvas.removeEventListener(
        'pointerupoutside',
        handlePointercanceloutside,
      );
    });
  }

  private _start = (ev: GestureEvent, target: IEventTarget) => {
    // 每次触点开始都重置事件
    this.reset();

    // 记录touch start 的时间
    this.startTime = clock.now();

    const { evCache, startPoints } = this;
    if (ev) {
      const { pointerId, x, y } = ev;

      // evcache 已经存在的 pointerId, 做替换
      const existIdx = evCache.findIndex(
        (item) => pointerId === item.pointerId,
      );
      if (existIdx !== -1) {
        evCache.splice(existIdx, 1);
      }

      // evCache 不存在的 pointerId, 添加
      evCache.push({
        pointerId,
        x,
        y,
        ev,
      });

      // @ts-ignore 对齐touches evCache 存在，touches 不存在，移除
      const evTouches = [...(ev.nativeEvent?.touches || [])];
      for (let i = evCache.length - 1; i > -1; i--) {
        const isInTouches = evTouches.find((touch) => {
          return evCache[i].pointerId === touch.identifier;
        });

        // 在touches中存在
        if (isInTouches) {
          continue;
        }

        // 在touches中不存在
        evCache.splice(i, 1);
      }
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
        this.emitStart(eventType, event, target);

        event.type = eventType;
        target.dispatchEvent(event);

        this.eventType = eventType;
        this.direction = direction;

        this.movingTarget = target;
      }, PRESS_DELAY);
      return;
    }

    // 目前只处理双指
    this.startDistance = calcDistance(startPoints[0], startPoints[1]);
    this.center = getCenter(startPoints[0], startPoints[1]);
  };

  private _move = (ev: GestureEvent, target: IEventTarget) => {
    this.clearPressTimeout();

    const { startPoints, evCache } = this;
    if (!startPoints.length) return;

    const { x, y, pointerId } = ev;

    // Find this event in the cache and update its record with this event
    for (let i = 0, len = evCache.length; i < len; i++) {
      if (pointerId === evCache[i].pointerId) {
        evCache[i] = {
          pointerId,
          x,
          y,
          ev,
        };
        break;
      }
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
      const eventType = this.getEventType(point, target, ev);
      ev.direction = direction;
      ev.deltaX = deltaX;
      ev.deltaY = deltaY;
      ev.points = points;
      this.emitStart(eventType, ev, target);
      ev.type = eventType;

      this.refreshAndGetTarget(target).dispatchEvent(ev);

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
    this.emitStart('pinch', ev, target);
    // touch 多指会被拆成多个手指的 move, 会触发多次 move，所以这里需要做节流
    this._throttleEmit('pinch', ev, target);
  };

  private _end = (ev: GestureEvent, target: IEventTarget) => {
    const { evCache, startPoints } = this;
    const points = evCache.map((ev) => {
      return { x: ev.x, y: ev.y };
    });
    ev.points = points;

    this.emitEnd(ev, this.refreshAndGetTarget(target));

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

            ev.type = 'swipe';
            target.dispatchEvent(ev);
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
      this._start(undefined, target);
    }
  };

  private _cancel = (ev: GestureEvent, target: IEventTarget) => {
    const { evCache } = this;
    const points = evCache.map((ev) => {
      return { x: ev.x, y: ev.y };
    });
    ev.points = points;

    this.emitEnd(ev, this.refreshAndGetTarget(target));

    this.evCache = [];
    this.reset();
  };

  private getEventType(point: Point, target, ev) {
    const { eventType, startTime, startPoints } = this;
    if (eventType) {
      return eventType;
    }
    // move的时候缓存节点，后续move和end都会使用这个target派发事件
    this.movingTarget = target;
    // 冒泡路径中是否有pan事件
    this.isPanListenerInPath = ev.path.some(
      (ele) => !!ele.emitter?.eventNames()?.includes('pan'),
    );
    let type: string;
    // 如果没有pan事件的监听，默认都是press
    if (!this.isPanListenerInPath) {
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
  private emitStart(type: string, ev: GestureEvent, target: IEventTarget) {
    if (this.isProcess(type)) {
      return;
    }
    this.enable(type);
    ev.type = `${type}start`;
    target.dispatchEvent(ev);
  }

  // 触发事件
  private _throttleEmit(type: string, ev: GestureEvent, target: IEventTarget) {
    // 主要是节流处理
    this.pushEvent(type, ev);
    const { throttleTimer, emitThrottles, processEvent } = this;
    if (throttleTimer) {
      return;
    }

    this.throttleTimer = this.canvas.requestAnimationFrame(() => {
      for (let i = 0, len = emitThrottles.length; i < len; i++) {
        const { type, ev } = emitThrottles[i];
        if (processEvent[type]) {
          ev.type = type;
          target.dispatchEvent(ev);
        }
      }
      // 清空
      this.throttleTimer = 0;
      this.emitThrottles.length = 0;
    });
  }

  // 触发end事件
  private emitEnd(ev: GestureEvent, target: IEventTarget) {
    const { processEvent } = this;
    Object.keys(processEvent).forEach((type) => {
      ev.type = `${type}end`;
      target.dispatchEvent(ev);
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

  private refreshAndGetTarget(target) {
    if (this.movingTarget) {
      // @ts-ignore
      if (this.movingTarget && !this.movingTarget.isConnected) {
        this.movingTarget = target;
      }
      return this.movingTarget;
    }
    return target;
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
    this.movingTarget = null;
    this.isPanListenerInPath = null;
  }
}
