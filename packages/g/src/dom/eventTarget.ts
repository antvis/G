import { isBoolean, isFunction, isObject } from '@antv/util';
import { EventEmitter } from 'eventemitter3';
import { CustomEvent } from './CustomEvent';
import { FederatedEvent } from './FederatedEvent';
import type { IElement, INode, IEventTarget } from './interfaces';
import { globalContainer } from '../global-module';

export const DELEGATION_SPLITTER = ':';

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
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ) {
    const capture = (isBoolean(options) && options) || (isObject(options) && options.capture);
    const once = isObject(options) && options.once;
    const context = isFunction(listener) ? undefined : listener;

    // compatible with G 3.0
    // support using delegate name in event type, eg. 'node:click'
    let useDelegatedName = false;
    let delegatedName = '';
    if (type.indexOf(DELEGATION_SPLITTER) > -1) {
      const [name, eventType] = type.split(DELEGATION_SPLITTER);
      type = eventType;
      delegatedName = name;
      useDelegatedName = true;
    }

    type = capture ? `${type}capture` : type;
    listener = isFunction(listener) ? listener : listener.handleEvent;

    // compatible with G 3.0
    if (useDelegatedName) {
      const originListener = listener;
      listener = (...args) => {
        if ((args[0].target as IElement)?.name !== delegatedName) {
          return;
        }
        originListener(...args);
      };
    }

    if (once) {
      this.emitter.once(type, listener, context);
    } else {
      this.emitter.on(type, listener, context);
    }

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
    this.emitter.removeAllListeners();
  }
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ) {
    const capture = (isBoolean(options) && options) || (isObject(options) && options.capture);
    const context = isFunction(listener) ? undefined : listener;

    type = capture ? `${type}capture` : type;
    listener = isFunction(listener) ? listener : listener.handleEvent;

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
  dispatchEvent<T extends FederatedEvent>(e: T): boolean {
    if (!(e instanceof FederatedEvent)) {
      throw new Error('DisplayObject cannot propagate events outside of the Federated Events API');
    }

    const document =
      // @ts-ignore
      (this as unknown as INode).ownerDocument || this.document;

    // assign event manager
    if (document) {
      e.manager = document.defaultView?.getEventService() || null;
      e.defaultPrevented = false;
      e.path = [];
      e.target = this;
      e.manager?.dispatchEvent(e);
    }

    return !e.defaultPrevented;
  }
}
