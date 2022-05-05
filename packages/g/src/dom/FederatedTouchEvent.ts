import { FederatedEvent } from './FederatedEvent';

/**
 * @see https://w3c.github.io/touch-events/#touchevent-interface
 */
export class FederatedTouchEvent
  extends FederatedEvent<MouseEvent | PointerEvent | TouchEvent>
  implements TouchEvent
{
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;

  changedTouches: TouchList;
  targetTouches: TouchList;
  touches: TouchList;
}
