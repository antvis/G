import { inject, injectable, postConstruct } from 'inversify';
import { EventEmitter } from 'eventemitter3';
import { DisplayObject } from '../DisplayObject';
import { FederatedEvent } from '../FederatedEvent';
import { FederatedMouseEvent } from '../FederatedMouseEvent';
import { FederatedPointerEvent } from '../FederatedPointerEvent';
import { FederatedWheelEvent } from '../FederatedWheelEvent';
import { Cursor, EventPosition, CanvasConfig } from '../types';
import { RenderingContext } from './RenderingContext';

type Picker = (position: EventPosition) => DisplayObject | null;
type TrackingData = {
  pressTargetsByButton: {
    [id: number]: DisplayObject[];
  };
  clicksByButton: {
    [id: number]: {
      clickCount: number;
      target: DisplayObject;
      timeStamp: number;
    }
  };
  overTargets: DisplayObject[] | null;
};
type EmitterListeners = Record<string,
  | Array<{ fn(...args: any[]): any, context: any }>
  | { fn(...args: any[]): any, context: any }
>;
const PROPAGATION_LIMIT = 2048;
export const DELEGATION_SPLITTER = ':';

@injectable()
export class EventService extends EventEmitter {
  @inject(RenderingContext)
  private renderingContext: RenderingContext;

  @inject(CanvasConfig)
  protected canvasConfig: CanvasConfig;

  private rootTarget: DisplayObject;

  cursor: Cursor | null = 'default';

  private mappingTable: Record<string, Array<{
    fn: (e: FederatedEvent) => void,
    priority: number
  }>> = {};
  private mappingState: Record<string, any> = {
    trackingData: {}
  };
  private eventPool: Map<typeof FederatedEvent, FederatedEvent[]> = new Map();

  private pickHandler: Picker;

  @postConstruct()
  init() {
    this.rootTarget = this.renderingContext.root;
    this.addEventMapping('pointerdown', this.onPointerDown);
    this.addEventMapping('pointerup', this.onPointerUp);
    this.addEventMapping('pointermove', this.onPointerMove);
    this.addEventMapping('pointerout', this.onPointerOut);
    this.addEventMapping('pointerleave', this.onPointerOut);
    this.addEventMapping('pointerover', this.onPointerOver);
    this.addEventMapping('pointerupoutside', this.onPointerUpOutside);
    this.addEventMapping('wheel', this.onWheel);
  }

  setPickHandler(pickHandler: Picker) {
    this.pickHandler = pickHandler;
  }

  addEventMapping(type: string, fn: (e: FederatedEvent) => void) {
    if (!this.mappingTable[type]) {
      this.mappingTable[type] = [];
    }

    this.mappingTable[type].push({
      fn,
      priority: 0,
    });
    this.mappingTable[type].sort((a, b) => a.priority - b.priority);
  }

  mapEvent(e: FederatedEvent) {
    if (!this.rootTarget) {
      return;
    }

    const mappers = this.mappingTable[e.type];

    if (mappers) {
      for (let i = 0, j = mappers.length; i < j; i++) {
        mappers[i].fn(e);
      }
    }
    else {
      console.warn(`[EventService]: Event mapping not defined for ${e.type}`);
    }
  }

  onPointerDown = (from: FederatedEvent) => {
    if (!(from instanceof FederatedPointerEvent)) {
      return;
    }

    const e = this.createPointerEvent(from);

    this.dispatchEvent(e, 'pointerdown');

    if (e.pointerType === 'touch') {
      this.dispatchEvent(e, 'touchstart');
    } else if (e.pointerType === 'mouse' || e.pointerType === 'pen') {
      const isRightButton = e.button === 2;
      this.dispatchEvent(e, isRightButton ? 'rightdown' : 'mousedown');
    }

    const trackingData = this.trackingData(from.pointerId);

    trackingData.pressTargetsByButton[from.button] = e.composedPath();

    this.freeEvent(e);
  };

  onPointerUp = (from: FederatedEvent) => {
    if (!(from instanceof FederatedPointerEvent)) {
      return;
    }

    const now = performance.now();
    const e = this.createPointerEvent(from);

    this.dispatchEvent(e, 'pointerup');

    if (e.pointerType === 'touch') {
      this.dispatchEvent(e, 'touchend');
    } else if (e.pointerType === 'mouse' || e.pointerType === 'pen') {
      const isRightButton = e.button === 2;
      this.dispatchEvent(e, isRightButton ? 'rightup' : 'mouseup');
    }

    const trackingData = this.trackingData(from.pointerId);
    const pressTarget = this.findMountedTarget(trackingData.pressTargetsByButton[from.button]);

    let clickTarget = pressTarget;

    // pointerupoutside only bubbles. It only bubbles upto the parent that doesn't contain
    // the pointerup location.
    if (pressTarget && !e.composedPath().includes(pressTarget)) {
      let currentTarget: DisplayObject | null = pressTarget;

      while (currentTarget && !e.composedPath().includes(currentTarget)) {
        e.currentTarget = currentTarget;

        this.notifyTarget(e, 'pointerupoutside');

        if (e.pointerType === 'touch') {
          this.notifyTarget(e, 'touchendoutside');
        } else if (e.pointerType === 'mouse' || e.pointerType === 'pen') {
          const isRightButton = e.button === 2;

          this.notifyTarget(e, isRightButton ? 'rightupoutside' : 'mouseupoutside');
        }

        currentTarget = currentTarget.parentNode;
      }

      delete trackingData.pressTargetsByButton[from.button];

      // currentTarget is the most specific ancestor holding both the pointerdown and pointerup
      // targets. That is - it's our click target!
      clickTarget = currentTarget;
    }

    if (clickTarget) {
      const clickEvent = this.clonePointerEvent(e, 'click');

      clickEvent.target = clickTarget;
      clickEvent.path = [];

      if (!trackingData.clicksByButton[from.button]) {
        trackingData.clicksByButton[from.button] = {
          clickCount: 0,
          target: clickEvent.target,
          timeStamp: now,
        };
      }

      const clickHistory = trackingData.clicksByButton[from.button];

      if (clickHistory.target === clickEvent.target
        && now - clickHistory.timeStamp < 200) {
        ++clickHistory.clickCount;
      }
      else {
        clickHistory.clickCount = 1;
      }

      clickHistory.target = clickEvent.target;
      clickHistory.timeStamp = now;

      clickEvent.detail = clickHistory.clickCount;

      if (clickEvent.pointerType === 'mouse') {
        this.dispatchEvent(clickEvent, 'click');
      } else if (clickEvent.pointerType === 'touch') {
        this.dispatchEvent(clickEvent, 'tap');
      } else {
        this.dispatchEvent(clickEvent, 'pointertap');
      }

      this.freeEvent(clickEvent);
    }

    this.freeEvent(e);
  }

  onPointerMove = (from: FederatedEvent) => {
    if (!(from instanceof FederatedPointerEvent)) {
      return;
    }

    const e = this.createPointerEvent(from);
    const isMouse = e.pointerType === 'mouse' || e.pointerType === 'pen';
    const trackingData = this.trackingData(from.pointerId);
    const outTarget = this.findMountedTarget(trackingData.overTargets);

    // First pointerout/pointerleave
    if (trackingData.overTargets && outTarget !== e.target) {
      // pointerout always occurs on the overTarget when the pointer hovers over another element.
      const outType = from.type === 'mousemove' ? 'mouseout' : 'pointerout';
      const outEvent = this.createPointerEvent(from, outType, outTarget || undefined);

      this.dispatchEvent(outEvent, 'pointerout');
      if (isMouse) this.dispatchEvent(outEvent, 'mouseout');

      // If the pointer exits overTarget and its descendants, then a pointerleave event is also fired. This event
      // is dispatched to all ancestors that no longer capture the pointer.
      // @ts-ignore
      if (!e.composedPath().includes(outTarget)) {
        const leaveEvent = this.createPointerEvent(from, 'pointerleave', outTarget || undefined);

        leaveEvent.eventPhase = leaveEvent.AT_TARGET;

        while (leaveEvent.target && !e.composedPath().includes(leaveEvent.target)) {
          leaveEvent.currentTarget = leaveEvent.target;

          this.notifyTarget(leaveEvent);
          if (isMouse) this.notifyTarget(leaveEvent, 'mouseleave');

          leaveEvent.target = leaveEvent.target.parentNode;
        }

        this.freeEvent(leaveEvent);
      }

      this.freeEvent(outEvent);
    }

    // Then pointerover
    if (outTarget !== e.target) {
      // pointerover always occurs on the new overTarget
      const overType = from.type === 'mousemove' ? 'mouseover' : 'pointerover';
      const overEvent = this.clonePointerEvent(e, overType);// clone faster

      this.dispatchEvent(overEvent, 'pointerover');
      if (isMouse) this.dispatchEvent(overEvent, 'mouseover');

      // Probe whether the newly hovered DisplayObject is an ancestor of the original overTarget.
      let overTargetAncestor = outTarget?.parentNode;

      while (overTargetAncestor && overTargetAncestor !== this.rootTarget?.parentNode) {
        if (overTargetAncestor === e.target) break;

        overTargetAncestor = overTargetAncestor.parentNode;
      }

      // The pointer has entered a non-ancestor of the original overTarget. This means we need a pointerentered
      // event.
      const didPointerEnter = !overTargetAncestor || overTargetAncestor === this.rootTarget?.parentNode;

      if (didPointerEnter) {
        const enterEvent = this.clonePointerEvent(e, 'pointerenter');

        enterEvent.eventPhase = enterEvent.AT_TARGET;

        while (enterEvent.target
          && enterEvent.target !== outTarget
          && enterEvent.target !== this.rootTarget?.parentNode) {
          enterEvent.currentTarget = enterEvent.target;

          this.notifyTarget(enterEvent);
          if (isMouse) this.notifyTarget(enterEvent, 'mouseenter');

          enterEvent.target = enterEvent.target.parentNode;
        }

        this.freeEvent(enterEvent);
      }

      this.freeEvent(overEvent);
    }

    // Then pointermove
    this.dispatchEvent(e, 'pointermove');

    if (e.pointerType === 'touch') this.dispatchEvent(e, 'touchmove');

    if (isMouse) {
      this.dispatchEvent(e, 'mousemove');
      this.cursor = this.getCursor(e.target);
    }

    trackingData.overTargets = e.composedPath();

    this.freeEvent(e);
  }

  onPointerOut = (from: FederatedEvent) => {
    if (!(from instanceof FederatedPointerEvent)) {
      return;
    }

    const trackingData = this.trackingData(from.pointerId);

    if (trackingData.overTargets) {
      const isMouse = from.pointerType === 'mouse' || from.pointerType === 'pen';
      const outTarget = this.findMountedTarget(trackingData.overTargets);

      // pointerout first
      const outEvent = this.createPointerEvent(from, 'pointerout', outTarget || undefined);

      this.dispatchEvent(outEvent);
      if (isMouse) this.dispatchEvent(outEvent, 'mouseout');

      // pointerleave(s) are also dispatched b/c the pointer must've left rootTarget and its descendants to
      // get an upstream pointerout event (upstream events do not know rootTarget has descendants).
      const leaveEvent = this.createPointerEvent(from, 'pointerleave', outTarget || undefined);

      leaveEvent.eventPhase = leaveEvent.AT_TARGET;

      while (leaveEvent.target && leaveEvent.target !== this.rootTarget?.parentNode) {
        leaveEvent.currentTarget = leaveEvent.target;

        this.notifyTarget(leaveEvent);
        if (isMouse) this.notifyTarget(leaveEvent, 'mouseleave');

        leaveEvent.target = leaveEvent.target.parentNode;
      }

      trackingData.overTargets = null;

      this.freeEvent(outEvent);
      this.freeEvent(leaveEvent);
    }

    this.cursor = null;
  }

  onPointerOver = (from: FederatedEvent) => {
    if (!(from instanceof FederatedPointerEvent)) {
      return;
    }

    const trackingData = this.trackingData(from.pointerId);
    const e = this.createPointerEvent(from);

    const isMouse = e.pointerType === 'mouse' || e.pointerType === 'pen';

    this.dispatchEvent(e, 'pointerover');
    if (isMouse) this.dispatchEvent(e, 'mouseover');
    if (e.pointerType === 'mouse') this.cursor = this.getCursor(e.target);

    // pointerenter events must be fired since the pointer entered from upstream.
    const enterEvent = this.clonePointerEvent(e, 'pointerenter');

    enterEvent.eventPhase = enterEvent.AT_TARGET;

    while (enterEvent.target && enterEvent.target !== this.rootTarget?.parentNode) {
      enterEvent.currentTarget = enterEvent.target;

      this.notifyTarget(enterEvent);
      if (isMouse) {
        // mouseenter should not bubble
        // @see https://developer.mozilla.org/en-US/docs/Web/API/Element/mouseenter_event#usage_notes
        this.notifyTarget(enterEvent, 'mouseenter');
      }

      enterEvent.target = enterEvent.target.parentNode;
    }

    trackingData.overTargets = e.composedPath();

    this.freeEvent(e);
    this.freeEvent(enterEvent);
  }

  onPointerUpOutside = (from: FederatedEvent) => {
    if (!(from instanceof FederatedPointerEvent)) {
      return;
    }

    const trackingData = this.trackingData(from.pointerId);
    const pressTarget = this.findMountedTarget(trackingData.pressTargetsByButton[from.button]);
    const e = this.createPointerEvent(from);

    if (pressTarget) {
      let currentTarget: DisplayObject | null = pressTarget;

      while (currentTarget) {
        e.currentTarget = currentTarget;

        this.notifyTarget(e, 'pointerupoutside');

        if (e.pointerType === 'touch') {
          this.notifyTarget(e, 'touchendoutside');
        }
        else if (e.pointerType === 'mouse' || e.pointerType === 'pen') {
          this.notifyTarget(e, e.button === 2 ? 'rightupoutside' : 'mouseupoutside');
        }

        currentTarget = currentTarget.parentNode;
      }

      delete trackingData.pressTargetsByButton[from.button];
    }

    this.freeEvent(e);
  }

  onWheel = (from: FederatedEvent) => {
    if (!(from instanceof FederatedWheelEvent)) {
      return;
    }

    const wheelEvent = this.createWheelEvent(from);

    this.dispatchEvent(wheelEvent);
    this.freeEvent(wheelEvent);
  }

  dispatchEvent(e: FederatedEvent, type?: string) {
    e.propagationStopped = false;
    e.propagationImmediatelyStopped = false;

    this.propagate(e, type);
    this.emit(type || e.type, e);
  }

  propagate(e: FederatedEvent, type?: string) {
    if (!e.target) {
      return;
    }

    // [target, parent, root]
    const composedPath = e.composedPath();

    // event flow: capture -> target -> bubbling

    // capture phase
    e.eventPhase = e.CAPTURING_PHASE;
    for (let i = composedPath.length - 1; i >= 1; i--) {
      e.currentTarget = composedPath[i];
      this.notifyTarget(e, type);
      if (e.propagationStopped || e.propagationImmediatelyStopped) return;
    }

    // target phase
    e.eventPhase = e.AT_TARGET;
    e.currentTarget = e.target;
    this.notifyTarget(e, type);
    if (e.propagationStopped || e.propagationImmediatelyStopped) return;

    // bubbling phase
    e.eventPhase = e.BUBBLING_PHASE;
    for (let i = 1; i < composedPath.length; i++) {
      e.currentTarget = composedPath[i];
      this.notifyTarget(e, type);
      if (e.propagationStopped || e.propagationImmediatelyStopped) return;
    }
  }

  propagationPath(target: DisplayObject): DisplayObject[] {
    const propagationPath = [target];

    for (let i = 0; i < PROPAGATION_LIMIT && target !== this.rootTarget; i++) {
      if (!target.parentNode) {
        throw new Error('Cannot find propagation path to disconnected target');
      }

      // [target, parent, parent, root]
      propagationPath.push(target.parentNode);
      target = target.parentNode;
    }

    return propagationPath;
  }

  hitTest(position: EventPosition): DisplayObject | null {
    const { x, y } = position;
    const { width, height } = this.canvasConfig;
    // outside canvas
    if (x < 0 || y < 0 || x > width || y > height) {
      return null;
    }
    return this.pickHandler(position) || this.rootTarget;
  }

  private createPointerEvent(
    from: FederatedPointerEvent,
    type?: string,
    target?: DisplayObject
  ): FederatedPointerEvent {
    const event = this.allocateEvent(FederatedPointerEvent);

    this.copyPointerData(from, event);
    this.copyMouseData(from, event);
    this.copyData(from, event);

    event.nativeEvent = from.nativeEvent;
    event._originalEvent = from;
    event.target = target ?? this.hitTest({
      clientX: event.clientX,
      clientY: event.clientY,
      x: event.global.x,
      y: event.global.y,
    }) as DisplayObject;

    if (typeof type === 'string') {
      event.type = type;
    }

    return event;
  }

  private createWheelEvent(from: FederatedWheelEvent): FederatedWheelEvent {
    const event = this.allocateEvent(FederatedWheelEvent);

    this.copyWheelData(from, event);
    this.copyMouseData(from, event);
    this.copyData(from, event);

    event.nativeEvent = from.nativeEvent;
    event._originalEvent = from;
    event.target = this.hitTest({
      clientX: event.clientX,
      clientY: event.clientY,
      x: event.global.x,
      y: event.global.y,
    }) as DisplayObject;

    return event;
  }

  private trackingData(id: number): TrackingData {
    if (!this.mappingState.trackingData[id]) {
      this.mappingState.trackingData[id] = {
        pressTargetsByButton: {},
        clicksByButton: {},
        overTarget: null
      };
    }

    return this.mappingState.trackingData[id];
  }

  private clonePointerEvent(from: FederatedPointerEvent, type?: string): FederatedPointerEvent {
    const event = this.allocateEvent(FederatedPointerEvent);

    event.nativeEvent = from.nativeEvent;
    event._originalEvent = from._originalEvent;

    this.copyPointerData(from, event);
    this.copyMouseData(from, event);
    this.copyData(from, event);

    event.target = from.target;
    event.path = from.composedPath().slice();
    event.type = type ?? event.type;

    return event;
  }

  private copyPointerData(from: FederatedEvent, to: FederatedEvent) {
    if (!(from instanceof FederatedPointerEvent && to instanceof FederatedPointerEvent)) return;

    to.pointerId = from.pointerId;
    to.width = from.width;
    to.height = from.height;
    to.isPrimary = from.isPrimary;
    to.pointerType = from.pointerType;
    to.pressure = from.pressure;
    to.tangentialPressure = from.tangentialPressure;
    to.tiltX = from.tiltX;
    to.tiltY = from.tiltY;
    to.twist = from.twist;
  }

  private copyMouseData(from: FederatedEvent, to: FederatedEvent) {
    if (!(from instanceof FederatedMouseEvent && to instanceof FederatedMouseEvent)) return;

    to.altKey = from.altKey;
    to.button = from.button;
    to.buttons = from.buttons;
    to.ctrlKey = from.ctrlKey;
    to.metaKey = from.metaKey;
    to.client.copyFrom(from.client);
    to.movement.copyFrom(from.movement);
    to.canvas.copyFrom(from.canvas);
    to.screen.copyFrom(from.screen);
    to.global.copyFrom(from.global);
    to.offset.copyFrom(from.offset);
  }

  private copyWheelData(from: FederatedWheelEvent, to: FederatedWheelEvent) {
    to.deltaMode = from.deltaMode;
    to.deltaX = from.deltaX;
    to.deltaY = from.deltaY;
    to.deltaZ = from.deltaZ;
  }

  private copyData(from: FederatedEvent, to: FederatedEvent) {
    to.isTrusted = from.isTrusted;
    to.timeStamp = performance.now();
    to.type = from.type;
    to.detail = from.detail;
    to.view = from.view;
    to.page.copyFrom(from.page);
  }

  private allocateEvent<T extends FederatedEvent>(
    constructor: { new(boundary: EventService): T }
  ): T {
    if (!this.eventPool.has(constructor as any)) {
      this.eventPool.set(constructor as any, []);
    }

    // @ts-ignore
    const event = this.eventPool.get(constructor as any).pop() as T
      || new constructor(this);

    event.eventPhase = event.NONE;
    event.currentTarget = null;
    event.path = [];
    event.target = null;

    return event;
  }

  private freeEvent<T extends FederatedEvent>(event: T) {
    if (event.manager !== this) throw new Error('It is illegal to free an event not managed by this EventBoundary!');

    const constructor = event.constructor;

    if (!this.eventPool.has(constructor as any)) {
      this.eventPool.set(constructor as any, []);
    }

    // @ts-ignore
    this.eventPool.get(constructor as any).push(event);
  }

  private notifyTarget(e: FederatedEvent, type?: string) {
    type = type ?? e.type;
    const key = e.eventPhase === e.CAPTURING_PHASE
      || e.eventPhase === e.AT_TARGET ? `${type}capture` : type;

    this.notifyListeners(e, key);

    if (e.eventPhase === e.AT_TARGET) {
      this.notifyListeners(e, type);
    }
  }

  private notifyListeners(e: FederatedEvent, type: string) {
    // hack EventEmitter, stops if the `propagationImmediatelyStopped` flag is set
    const listeners = ((e.currentTarget as any).emitter._events as EmitterListeners)[type];

    if (!listeners) return;

    if ('fn' in listeners) {
      listeners.fn.call(listeners.context, e);
    }
    else {
      for (let i = 0; i < listeners.length && !e.propagationImmediatelyStopped; i++) {
        listeners[i].fn.call(listeners[i].context, e);
      }
    }
  }

  /**
   * some detached nodes may exist in propagation path, need to skip them
   */
  private findMountedTarget(propagationPath: DisplayObject[] | null): DisplayObject | null {
    if (!propagationPath) {
      return null;
    }

    let currentTarget = propagationPath[propagationPath.length - 1];
    for (let i = propagationPath.length - 2; i >= 0; i--) {
      if (propagationPath[i].parentNode === currentTarget) {
        currentTarget = propagationPath[i];
      } else {
        break;
      }
    }

    return currentTarget;
  }

  private getCursor(target: DisplayObject | null) {
    let tmp: DisplayObject | null = target;
    while (tmp) {
      const cursor = tmp.getAttribute('cursor');
      if (cursor) {
        return cursor;
      }
      tmp = tmp.parentNode;
    }
  }
}
