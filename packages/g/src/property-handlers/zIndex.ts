import type { DisplayObject } from '../display-objects/DisplayObject';
import { Element } from '../dom';

export function updateZIndex(oldZIndex: number, newZIndex: number, object: DisplayObject) {
  if (object.parentNode) {
    const parentEntity = object.parentNode as Element;
    const parentRenderable = parentEntity.renderable;
    const parentSortable = parentEntity.sortable;
    if (parentRenderable) {
      parentRenderable.dirty = true;
    }
    // need re-sort on parent
    if (parentSortable) {
      parentSortable.dirty = true;
    }
  }
}
