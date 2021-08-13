import { isBoolean, isFunction, isObject } from '@antv/util';
import { EventEmitter } from 'eventemitter3';
import { FederatedEvent } from './FederatedEvent';

export class GEventTarget {
  /**
   * event emitter
   */
  emitter = new EventEmitter();

  /**
   * @alias addEventListener
   */
  on(
    type: string,
    listener: EventListenerOrEventListenerObject | ((...args: any[]) => void),
    options?: boolean | AddEventListenerOptions,
  ) {
    this.addEventListener(type, listener, options);
  }

  /**
   * support `capture` & `once` in options
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/EventTarget/addEventListener
   */
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ) {
    const capture = (isBoolean(options) && options) || (isObject(options) && options.capture);
    const once = isObject(options) && options.once;
    const context = isFunction(listener) ? undefined : listener;

    type = capture ? `${type}capture` : type;
    listener = isFunction(listener) ? listener : listener.handleEvent;

    if (once) {
      this.emitter.once(type, listener, context);
    } else {
      this.emitter.on(type, listener, context);
    }
  }

  /**
   * @alias removeEventListener
   */
  off(
    type: string,
    listener: EventListenerOrEventListenerObject | ((...args: any[]) => void),
    options?: boolean | EventListenerOptions,
  ) {
    this.removeEventListener(type, listener, options);
  }

  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ) {
    const capture = (isBoolean(options) && options) || (isObject(options) && options.capture);
    const context = isFunction(listener) ? undefined : listener;

    type = capture ? `${type}capture` : type;
    listener = isFunction(listener) ? listener : listener.handleEvent;

    this.emitter.off(type, listener, context);
  }

  emit(event: string | symbol, ...args: any[]) {
    this.emitter.emit(event, ...args);
  }

  dispatchEvent(e: Event): boolean {
    if (!(e instanceof FederatedEvent)) {
      throw new Error('DisplayObject cannot propagate events outside of the Federated Events API');
    }

    e.defaultPrevented = false;
    e.path = [];
    e.target = this;
    e.manager?.dispatchEvent(e);

    return !e.defaultPrevented;
  }
}
