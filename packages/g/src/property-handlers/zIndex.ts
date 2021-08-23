import type { DisplayObject } from '../DisplayObject';
import { Sortable, Renderable } from '../components';

export function updateZIndex(oldZIndex: number, newZIndex: number, object: DisplayObject) {
  if (object.parentNode) {
    const parentEntity = object.parentNode.getEntity();
    const parentRenderable = parentEntity.getComponent(Renderable);
    const parentSortable = parentEntity.getComponent(Sortable);
    if (parentRenderable) {
      parentRenderable.dirty = true;
    }
    // need re-sort on parent
    if (parentSortable) {
      parentSortable.dirty = true;
    }
  }
}
