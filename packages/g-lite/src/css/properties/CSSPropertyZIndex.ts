import { singleton } from '@alipay/mana-syringe';
import type { DisplayObject } from '../../display-objects';
import type { CSSUnitValue } from '../cssom';
import { CSSProperty } from '../CSSProperty';
import { PropertySyntax } from '../interfaces';
import { parseNumber } from '../parser/numeric';

@singleton({
  token: {
    token: CSSProperty,
    named: PropertySyntax.Z_INDEX,
  },
})
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
