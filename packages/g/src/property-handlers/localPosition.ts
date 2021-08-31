import { Renderable } from '../components';
import type { DisplayObject } from '../DisplayObject';
import { SHAPE } from '../types';

export function updateLocalPosition(oldValue: number, newValue: number, object: DisplayObject) {
  const renderable = object.getEntity().getComponent(Renderable);
  const { x = 0, y = 0, diffX = 0, diffY = 0 } = object.parsedStyle;

  if (object.nodeName === SHAPE.Path) {
    object.translateLocal(diffX, diffY);
  } else {
    object.setLocalPosition(x, y);
  }

  // dirtify renderable's AABB
  renderable.aabbDirty = true;
  renderable.dirty = true;
}
