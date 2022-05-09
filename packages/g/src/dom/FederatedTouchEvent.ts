import type { FormattedTouch } from '../utils';
import { FederatedEvent } from './FederatedEvent';

/**
 * @see https://w3c.github.io/touch-events/#touchevent-interface
 */
export class FederatedTouchEvent
  extends FederatedEvent<MouseEvent | PointerEvent | TouchEvent>
  implements TouchEvent
{
  pointerType: string;

  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;

  // @ts-ignore
  changedTouches: FormattedTouch[];
  // @ts-ignore
  targetTouches: FormattedTouch[];
  // @ts-ignore
  touches: FormattedTouch[];
}
