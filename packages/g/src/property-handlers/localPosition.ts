import type { DisplayObject } from '../display-objects';

export function updateLocalPosition(oldValue: number, newValue: number, object: DisplayObject) {
  const { x = 0, y = 0, z = 0 } = object.parsedStyle;

  // update local position when x/y changed
  object.setLocalPosition(x, y, z);
}
