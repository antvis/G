import { Renderable, Transform } from '../components';
import type { DisplayObject } from '../DisplayObject';

export function updateLocalPosition(oldValue: number, newValue: number, object: DisplayObject) {
  const renderable = object.getEntity().getComponent(Renderable);
  const { x = 0, y = 0 } = object.parsedStyle;

  object.setLocalPosition(x, y);

  console.log(object.getPosition(), object.getLocalPosition());

  // dirtify renderable's AABB
  renderable.aabbDirty = true;
  renderable.dirty = true;
}
