import { Renderable } from '../components';
import type { DisplayObject } from '../DisplayObject';

export function updateLocalPosition(oldValue: number, newValue: number, object: DisplayObject) {
  const renderable = object.getEntity().getComponent(Renderable);
  const { x = 0, y = 0 } = object.parsedStyle;

  // update local position when x/y changed
  object.setLocalPosition(x, y);

  // dirtify renderable's AABB
  renderable.aabbDirty = true;
  renderable.dirty = true;
}
