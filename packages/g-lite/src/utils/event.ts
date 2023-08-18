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

export interface FormattedTouch extends Touch {
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

export const clock =
  typeof performance === 'object' && performance.now ? performance : Date;
