import { isBoolean, isFunction } from '@antv/util';
import EventEmitter from 'eventemitter3';
import { CustomEvent } from './CustomEvent';
import { FederatedEvent } from './FederatedEvent';
import type {
  EventListenerOrEventListenerObject,
  ICanvas,
  IDocument,
  IEventTarget,
  INode,
} from './interfaces';

const CANVAS_CACHE = new WeakMap<IEventTarget, ICanvas>();

/**
 * Objects that can receive events and may have listeners for them.
 * eg. Element, Canvas, DisplayObject
 * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget
 */
export class EventTarget implements IEventTarget {
  /**
   * event emitter
   */
  emitter = new EventEmitter();

  /**
   * @deprecated
   * @alias addEventListener
   */
  on(
    type: string,
    listener: EventListenerOrEventListenerObject | ((...args: any[]) => void),
    options?: boolean | AddEventListenerOptions,
  ) {
    this.addEventListener(type, listener, options);
    return this;
  }
  /**
   * support `capture` & `once` in options
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener
   */
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | ((...args: any[]) => void),
    options?: boolean | AddEventListenerOptions,
  ) {
    let capture = false;
    let once = false;

    if (isBoolean(options)) capture = options;
    else if (options) ({ capture = false, once = false } = options);

    if (capture) type += 'capture';
    // eslint-disable-next-line @typescript-eslint/unbound-method
    listener = isFunction(listener) ? listener : listener.handleEvent;

    const context = isFunction(listener) ? undefined : listener;

    if (once) this.emitter.once(type, listener, context);
    else this.emitter.on(type, listener, context);

    return this;
  }
  /**
   * @deprecated
   * @alias removeEventListener
   */
  off(
    type: string,
    listener: EventListenerOrEventListenerObject | ((...args: any[]) => void),
    options?: boolean | AddEventListenerOptions,
  ) {
    if (type) {
      this.removeEventListener(type, listener, options);
    } else {
      // remove all listeners
      this.removeAllEventListeners();
    }
    return this;
  }

  removeAllEventListeners() {
    this.emitter?.removeAllListeners();
  }

  removeEventListener(
    type: string,
    listener?: EventListenerOrEventListenerObject | ((...args: any[]) => void),
    options?: boolean | AddEventListenerOptions,
  ) {
    if (!this.emitter) return this;

    const capture = isBoolean(options) ? options : options?.capture;
    if (capture) type += 'capture';
    // eslint-disable-next-line @typescript-eslint/unbound-method
    listener = isFunction(listener) ? listener : listener?.handleEvent;
    const context = isFunction(listener) ? undefined : listener;

    this.emitter.off(type, listener, context);
    return this;
  }
  /**
   * @deprecated
   * @alias dispatchEvent
   */
  emit(eventName: string, object: object) {
    this.dispatchEvent(new CustomEvent(eventName, object));
  }
  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent
   */
  dispatchEvent<T extends FederatedEvent>(
    e: T,
    skipPropagate = false,
  ): boolean {
    let canvas: ICanvas = CANVAS_CACHE.get(this);

    if (!canvas) {
      // @ts-expect-error document may be defined in inherited class
      if (this.document) canvas = this as unknown as ICanvas;
      // @ts-expect-error defaultView may be defined in inherited class
      else if (this.defaultView)
        canvas = (this as unknown as IDocument).defaultView;
      else canvas = (this as unknown as INode).ownerDocument?.defaultView;

      if (canvas) CANVAS_CACHE.set(this, canvas);
    }

    if (canvas) {
      e.manager = canvas.getEventService();
      if (!e.manager) return false;

      e.defaultPrevented = false;
      if (e.path) e.path.length = 0;
      // @ts-ignore
      else e.page = [];

      if (!skipPropagate) e.target = this;
      e.manager.dispatchEvent(e, e.type, skipPropagate);
    } else {
      // HACK Fixed the issue that after an element leaves the DOM tree, there is no associated canvas,
      // which causes the removed and destroy events to not be triggered
      this.emitter.emit(e.type, e);
    }

    return !e.defaultPrevented;
  }
}
