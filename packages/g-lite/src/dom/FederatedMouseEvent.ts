import type { DisplayObject } from '../display-objects/DisplayObject';
import { Point } from '../shapes/Point';
import { ERROR_MSG_METHOD_NOT_IMPLEMENTED } from '../utils';
import { FederatedEvent } from './FederatedEvent';

export class FederatedMouseEvent
  extends FederatedEvent<MouseEvent | PointerEvent | TouchEvent>
  implements MouseEvent
{
  /** Whether the "alt" key was pressed when this mouse event occurred. */
  altKey: boolean;

  /** The specific button that was pressed in this mouse event. */
  button: number;

  /** The button depressed when this event occurred. */
  buttons: number;

  /** Whether the "control" key was pressed when this mouse event occurred. */
  ctrlKey: boolean;

  /** Whether the "meta" key was pressed when this mouse event occurred. */
  metaKey: boolean;

  /** This is currently not implemented in the Federated Events API. */
  // @ts-ignore
  relatedTarget: DisplayObject | null;

  /** Whether the "shift" key was pressed when this mouse event occurred. */
  shiftKey: boolean;

  /**
   * The coordinates of the mouse event relative to the canvas.
   */
  client: Point = new Point();
  get clientX(): number {
    return this.client.x;
  }
  get clientY(): number {
    return this.client.y;
  }

  /**
   * The movement in this pointer relative to the last `mousemove` event.
   */
  movement: Point = new Point();
  get movementX(): number {
    return this.movement.x;
  }
  get movementY(): number {
    return this.movement.y;
  }

  /**
   * The offset of the pointer coordinates w.r.t. target DisplayObject in world space. This is
   * not supported at the moment.
   */
  offset: Point = new Point();
  get offsetX(): number {
    return this.offset.x;
  }
  get offsetY(): number {
    return this.offset.y;
  }

  /**
   * The pointer coordinates in world space.
   */
  global: Point = new Point();
  get globalX(): number {
    return this.global.x;
  }
  get globalY(): number {
    return this.global.y;
  }

  /**
   * The pointer coordinates in sceen space.
   */
  screen: Point = new Point();
  get screenX(): number {
    return this.screen.x;
  }
  get screenY(): number {
    return this.screen.y;
  }

  getModifierState(key: string): boolean {
    return (
      'getModifierState' in this.nativeEvent &&
      this.nativeEvent.getModifierState(key)
    );
  }
  initMouseEvent(): void {
    throw new Error(ERROR_MSG_METHOD_NOT_IMPLEMENTED);
  }
}
