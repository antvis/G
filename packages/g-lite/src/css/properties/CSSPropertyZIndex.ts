import type { DisplayObject } from '../../display-objects';
import type { CSSUnitValue } from '../cssom';
import type { CSSProperty } from '../CSSProperty';
import { parseNumber } from '../parser/numeric';

export class CSSPropertyZIndex implements Partial<CSSProperty<CSSUnitValue, number>> {
  parser = parseNumber;

  calculator(
    name: string,
    oldParsed: CSSUnitValue,
    computed: CSSUnitValue,
    object: DisplayObject,
  ): number {
    return computed.value;
  }

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
