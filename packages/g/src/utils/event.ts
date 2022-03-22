import { isUndefined } from '@antv/util';
import type { InteractivePointerEvent } from '../types';
// use `self` instead of `window`, account for non-window contexts, such as in Web Workers
// @see https://developer.mozilla.org/en-US/docs/Web/API/Window/self
export const supportsTouchEvents = !!self.TouchEvent;
export const supportsPointerEvents = !!self.PointerEvent;
export const MOUSE_POINTER_ID = 1;
export const TOUCH_TO_POINTER: Record<string, string> = {
  touchstart: 'pointerdown',
  touchend: 'pointerup',
  touchendoutside: 'pointerupoutside',
  touchmove: 'pointermove',
  touchcancel: 'pointercancel',
};

export function isTouchEvent(event: InteractivePointerEvent): event is TouchEvent {
  return supportsTouchEvents && event instanceof TouchEvent;
}

export function isMouseEvent(event: InteractivePointerEvent): event is MouseEvent {
  return (
    !self.MouseEvent ||
    (event instanceof MouseEvent &&
      (!supportsPointerEvents || !(event instanceof self.PointerEvent)))
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
}

/**
 * borrow from pixi/events
 */
export function normalizeToPointerEvent(event: InteractivePointerEvent): PointerEvent {
  let normalizedEvent;
  if (isTouchEvent(event)) {
    const touches = [];
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i] as FormattedTouch;

      // use changedTouches instead of touches since touchend has no touches
      // @see https://stackoverflow.com/a/10079076
      if (isUndefined(touch.button)) touch.button = event.changedTouches.length ? 1 : 0;
      if (isUndefined(touch.buttons)) touch.buttons = event.changedTouches.length ? 1 : 0;
      if (isUndefined(touch.isPrimary)) {
        touch.isPrimary = event.touches.length === 1 && event.type === 'touchstart';
      }
      if (isUndefined(touch.width)) touch.width = touch.radiusX || 1;
      if (isUndefined(touch.height)) touch.height = touch.radiusY || 1;
      if (isUndefined(touch.tiltX)) touch.tiltX = 0;
      if (isUndefined(touch.tiltY)) touch.tiltY = 0;
      if (isUndefined(touch.pointerType)) touch.pointerType = 'touch';
      if (isUndefined(touch.pointerId)) touch.pointerId = touch.identifier || 0;
      if (isUndefined(touch.pressure)) touch.pressure = touch.force || 0.5;
      if (isUndefined(touch.twist)) touch.twist = 0;
      if (isUndefined(touch.tangentialPressure)) touch.tangentialPressure = 0;
      touch.isNormalized = true;
      touch.type = event.type;
      touches.push(touch);
    }
    normalizedEvent = { ...event, touches };
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

    normalizedEvent = tempEvent;
  } else {
    normalizedEvent = event;
  }

  return normalizedEvent as PointerEvent;
}
