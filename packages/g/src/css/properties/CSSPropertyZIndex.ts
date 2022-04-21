import { singleton } from 'mana-syringe';
import type { CSSProperty, CSSUnitValue, DisplayObject } from '../..';
import { parseNumber } from '../..';

@singleton()
export class CSSPropertyZIndex implements Partial<CSSProperty<CSSUnitValue, CSSUnitValue>> {
  parser = parseNumber;

  postProcessor(object: DisplayObject) {
    if (object.parentNode) {
      const parentEntity = object.parentNode as DisplayObject;
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
}
