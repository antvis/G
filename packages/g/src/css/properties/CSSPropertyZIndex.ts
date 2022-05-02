import { singleton } from 'mana-syringe';
import type { CSSProperty } from '../CSSProperty';
import type { CSSUnitValue } from '../cssom';
import type { DisplayObject } from '../../display-objects';
import { parseNumber } from '../parser';

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
