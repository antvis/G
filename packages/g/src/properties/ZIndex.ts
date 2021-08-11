import { injectable } from 'inversify';
import type { DisplayObject } from '../DisplayObject';
import type { StylePropertyHandler } from '.';
import { Sortable, Renderable } from '../components';

@injectable()
export class ZIndex implements StylePropertyHandler<number, number> {
  update(oldZIndex: number, newZIndex: number, object: DisplayObject) {
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
}