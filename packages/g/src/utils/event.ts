import { isUndefined } from '@antv/util';
import type { InteractivePointerEvent } from '../types';

// borrow from hammer.js
const MOBILE_REGEX = /mobile|tablet|ip(ad|hone|od)|android/i;

// use `globalThis` instead of `window` or `self`, account for non-window contexts, such as in Web Workers
// @see https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/globalThis
export const SUPPORT_TOUCH = 'ontouchstart' in globalThis;
export const SUPPORT_POINTER_EVENTS = !!globalThis.PointerEvent;
export const SUPPORT_ONLY_TOUCH = SUPPORT_TOUCH && MOBILE_REGEX.test(navigator.userAgent);
export const MOUSE_POINTER_ID = 1;
export const TOUCH_TO_POINTER: Record<string, string> = {
  touchstart: 'pointerdown',
  touchend: 'pointerup',
  touchendoutside: 'pointerupoutside',
  touchmove: 'pointermove',
  touchcancel: 'pointercancel',
};

export function isTouchEvent(event: InteractivePointerEvent): event is TouchEvent {
  return SUPPORT_TOUCH && event instanceof globalThis.TouchEvent;
}

export function isMouseEvent(event: InteractivePointerEvent): event is MouseEvent {
  return (
    !globalThis.MouseEvent ||
    (event instanceof globalThis.MouseEvent &&
      (!SUPPORT_POINTER_EVENTS || !(event instanceof globalThis.PointerEvent)))
  );
}

interface FormattedPointerEvent extends PointerEvent {
  isPrimary: boolean;
  width: number;
  height: number;
  tiltX: number;
  tiltY: number;
  pointerType: string;
  pointerId: number;
  pressure: number;
  twist: number;
  tangentialPressure: number;
  isNormalized: boolean;
  type: string;
}

interface FormattedTouch extends Touch {
  button: number;
  buttons: number;
  isPrimary: boolean;
  width: number;
  height: number;
  tiltX: number;
  tiltY: number;
  pointerType: string;
  pointerId: number;
  pressure: number;
  twist: number;
  tangentialPressure: number;
  layerY: number;
  offsetX: number;
  offsetY: number;
  isNormalized: boolean;
  type: string;

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/TouchEvent/changedTouches
   */
  changedTouches: FormattedTouch[];

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/TouchEvent/touches
   */
  touches: FormattedTouch[];

  /**
   * the final event in touchlist should trigger touch event
   */
  isFinal: boolean;
}

/**
 * borrow from pixi/events
 */
export function normalizeToPointerEvent(event: InteractivePointerEvent): PointerEvent[] {
  const normalizedEvents = [];
  if (isTouchEvent(event)) {
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i] as FormattedTouch;

      // use changedTouches instead of touches since touchend has no touches
      // @see https://stackoverflow.com/a/10079076
      if (isUndefined(touch.button)) touch.button = event.touches.length ? 1 : 0;
      if (isUndefined(touch.buttons)) touch.buttons = event.touches.length ? 1 : 0;
      if (isUndefined(touch.isPrimary)) {
        touch.isPrimary = event.touches.length === 1 && event.type === 'touchstart';
      }
      if (isUndefined(touch.width)) touch.width = touch.radiusX || 1;
      if (isUndefined(touch.height)) touch.height = touch.radiusY || 1;
      if (isUndefined(touch.tiltX)) touch.tiltX = 0;
      if (isUndefined(touch.tiltY)) touch.tiltY = 0;
      if (isUndefined(touch.pointerType)) touch.pointerType = 'touch';
      // @see https://developer.mozilla.org/zh-CN/docs/Web/API/Touch/identifier
      if (isUndefined(touch.pointerId)) touch.pointerId = touch.identifier || 0;
      if (isUndefined(touch.pressure)) touch.pressure = touch.force || 0.5;
      if (isUndefined(touch.twist)) touch.twist = 0;
      if (isUndefined(touch.tangentialPressure)) touch.tangentialPressure = 0;
      touch.isNormalized = true;
      touch.type = event.type;

      // the l
      touch.isFinal = i === event.changedTouches.length - 1;
      normalizedEvents.push(touch);
    }
  } else if (isMouseEvent(event)) {
    const tempEvent = event as FormattedPointerEvent;
    if (isUndefined(tempEvent.isPrimary)) tempEvent.isPrimary = true;
    if (isUndefined(tempEvent.width)) tempEvent.width = 1;
    if (isUndefined(tempEvent.height)) tempEvent.height = 1;
    if (isUndefined(tempEvent.tiltX)) tempEvent.tiltX = 0;
    if (isUndefined(tempEvent.tiltY)) tempEvent.tiltY = 0;
    if (isUndefined(tempEvent.pointerType)) tempEvent.pointerType = 'mouse';
    if (isUndefined(tempEvent.pointerId)) tempEvent.pointerId = MOUSE_POINTER_ID;
    if (isUndefined(tempEvent.pressure)) tempEvent.pressure = 0.5;
    if (isUndefined(tempEvent.twist)) tempEvent.twist = 0;
    if (isUndefined(tempEvent.tangentialPressure)) tempEvent.tangentialPressure = 0;
    tempEvent.isNormalized = true;

    normalizedEvents.push(tempEvent);
  } else {
    normalizedEvents.push(event);
  }

  return normalizedEvents as PointerEvent[];
}
