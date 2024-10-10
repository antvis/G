import type { DisplayObject } from '@antv/g-lite';
import { styleAttributeNames } from '../enum';
import { GElement } from '../GElement';

const getGParents = (el: GElement) => {
  let result: GElement | null = el.parentElement as GElement;
  while (!result?.isGElement && result) {
    if (result?.tagName === 'BODY') {
      return null;
    }
    result = result?.parentElement as GElement;
  }

  return result;
};

const getJSONValue = (val: any) => {
  try {
    return JSON.parse(val);
  } catch {
    return val;
  }
};

export abstract class BaseShape extends GElement {
  abstract getElementInstance(): DisplayObject;

  static get observedAttributes() {
    return styleAttributeNames;
  }

  getAttrsData() {
    const attriubutes = Array.from(this.attributes);

    return attriubutes.reduce(
      (o, a) => {
        o[a.nodeName] = getJSONValue(a.nodeValue);
        return o;
      },
      {} as Record<string, any>,
    );
  }

  attributeChangedCallback(name: string, last: any, val: any) {
    if (this.gElement) {
      this.gElement?.setAttribute(name, getJSONValue(val));
    }
  }

  connectedCallback() {
    const element = this.getElementInstance();
    const realParent = getGParents(this);
    this.gElement = element;

    if (realParent) {
      realParent.gElement?.appendChild(element);
    }
  }

  disconnectedCallback() {
    this.gElement?.remove();
    this.gElement = null;
  }

  getBoundingClientRect() {
    return this.gElement?.getBoundingClientRect() as DOMRect;
  }

  getClientRects() {
    return (this.gElement?.getClientRects() || []) as any;
  }

  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(type: any, listener: any, options?: any): void {
    this.gElement?.addEventListener(type, listener, options);
  }

  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(type: any, listener: any, options?: any): void {
    this.gElement?.removeEventListener(type, listener, options);
  }
}
