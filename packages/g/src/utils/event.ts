import type { IEventTarget } from '../dom';

// borrow from hammer.js
export const MOUSE_POINTER_ID = 1;
export const TOUCH_TO_POINTER: Record<string, string> = {
  touchstart: 'pointerdown',
  touchend: 'pointerup',
  touchendoutside: 'pointerupoutside',
  touchmove: 'pointermove',
  touchcancel: 'pointercancel',
};

export interface FormattedPointerEvent extends PointerEvent {
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

// export interface FormattedTouchEvent extends TouchEvent {
export interface FormattedTouchEvent {
  isNormalized: boolean;
  type: string;
  /**
   * we don't implement TouchList here
   *
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/TouchEvent/changedTouches
   */
  changedTouches: FormattedTouch[];

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/TouchEvent/touches
   */
  touches: FormattedTouch[];

  /**
   * @see https://developer.mozilla.org/zh-CN/docs/Web/API/TouchEvent/targetTouches
   */
  targetTouches: FormattedTouch[];
}

export interface FormattedTouch extends Touch {
  x: number;
  y: number;
  canvasX: number;
  canvasY: number;
  viewportX: number;
  viewportY: number;
  target: IEventTarget | null;
  nativeTouch: Touch;
}
