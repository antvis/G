import { InteractivePointerEvent } from '@antv/g';

// use `self` instead of `window`, account for non-window contexts, such as in Web Workers
// @see https://developer.mozilla.org/en-US/docs/Web/API/Window/self
export const supportsTouchEvents = 'ontouchstart' in self;
export const supportsPointerEvents = !!self.PointerEvent;

export function isTouchEvent(event: InteractivePointerEvent): event is TouchEvent {
  return supportsTouchEvents && event instanceof TouchEvent;
}

export function isMouseEvent(event: InteractivePointerEvent): event is MouseEvent {
  return (
    !self.MouseEvent ||
    (event instanceof MouseEvent && (!supportsPointerEvents || !(event instanceof self.PointerEvent)))
  );
}

/**
 * borrow from pixi/interaction
 * Ensures that the original event object contains all data that a regular pointer event would have
 */
export function normalizeToPointerEvent(event: InteractivePointerEvent): PointerEvent {
  if (isTouchEvent(event)) {
    // for (let i = 0; i < event.changedTouches.length; i++) {
    const touch = event.changedTouches[0];
    // @ts-ignore
    return {
      button: event.touches.length ? 1 : 0,
      buttons: event.touches.length ? 1 : 0,
      isPrimary: event.touches.length === 1 && event.type === 'touchstart',
      width: touch.radiusX || 1,
      height: touch.radiusY || 1,
      tiltX: 0,
      tiltY: 0,
      pointerType: 'touch',
      pointerId: touch.identifier || 0,
      pressure: touch.force || 0.5,
      twist: 0,
      tangentialPressure: 0,
      offsetX: touch.clientX,
      offsetY: touch.clientY,
      ...touch,
    };
    // }
  } else if (isMouseEvent(event)) {
    // @ts-ignore
    return {
      isPrimary: true,
      width: 1,
      height: 1,
      tiltX: 0,
      tiltY: 0,
      pointerType: 'mouse',
      pointerId: 10,
      pressure: 0.5,
      twist: 0,
      tangentialPressure: 0,
      ...event,
    };
  } else {
    return event;
  }
}
