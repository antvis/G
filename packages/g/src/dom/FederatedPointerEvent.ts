import { FederatedMouseEvent } from './FederatedMouseEvent';

export class FederatedPointerEvent extends FederatedMouseEvent implements PointerEvent {
  /**
   * The unique identifier of the pointer.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/pointerId
   */
  pointerId: number;

  /**
   * The width of the pointer's contact along the x-axis, measured in CSS pixels.
   * radiusX of TouchEvents will be represented by this value.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/width
   */
  width = 0;

  /**
   * The height of the pointer's contact along the y-axis, measured in CSS pixels.
   * radiusY of TouchEvents will be represented by this value.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/height
   */
  height = 0;

  /**
   * Indicates whether or not the pointer device that created the event is the primary pointer.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/isPrimary
   */
  isPrimary = false;

  /**
   * The type of pointer that triggered the event.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/pointerType
   */
  pointerType: string;

  /**
   * Pressure applied by the pointing device during the event.
   *s
   * A Touch's force property will be represented by this value.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/pressure
   */
  pressure: number;

  /**
   * Barrel pressure on a stylus pointer.
   *
   * @see https://w3c.github.io/pointerevents/#pointerevent-interface
   */
  tangentialPressure: number;

  /**
   * The angle, in degrees, between the pointer device and the screen.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/tiltX
   */
  tiltX: number;

  /**
   * The angle, in degrees, between the pointer device and the screen.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/tiltY
   */
  tiltY: number;

  /**
   * Twist of a stylus pointer.
   *
   * @see https://w3c.github.io/pointerevents/#pointerevent-interface
   */
  twist: number;

  getCoalescedEvents(): PointerEvent[] {
    if (this.type === 'pointermove' || this.type === 'mousemove' || this.type === 'touchmove') {
      return [this];
    }
    return [];
  }
  getPredictedEvents(): PointerEvent[] {
    throw new Error('getPredictedEvents is not supported!');
  }
}
