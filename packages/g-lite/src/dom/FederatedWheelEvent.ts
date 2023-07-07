import { FederatedMouseEvent } from './FederatedMouseEvent';

// @ts-ignore
export class FederatedWheelEvent
  extends FederatedMouseEvent
  implements WheelEvent
{
  /**
   * The units of `deltaX`, `deltaY`, and `deltaZ`. This is one of `DOM_DELTA_LINE`,
   * `DOM_DELTA_PAGE`, `DOM_DELTA_PIXEL`.
   */
  deltaMode: number;

  /** Horizontal scroll amount */
  deltaX: number;

  /** Vertical scroll amount */
  deltaY: number;

  /** z-axis scroll amount. */
  deltaZ: number;

  readonly DOM_DELTA_PIXEL: 0x00;
  readonly DOM_DELTA_LINE: 0x01;
  readonly DOM_DELTA_PAGE: 0x02;

  clone() {
    return this.manager.cloneWheelEvent(this);
  }
}
