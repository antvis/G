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
