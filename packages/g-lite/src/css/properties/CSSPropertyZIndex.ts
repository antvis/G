import { SortReason } from '../../components';
import type { DisplayObject } from '../../display-objects';
import type { CSSUnitValue } from '../cssom';
import type { CSSProperty } from '../CSSProperty';

export class CSSPropertyZIndex
  implements Partial<CSSProperty<CSSUnitValue, number>>
{
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
        parentSortable.dirtyReason = SortReason.Z_INDEX_CHANGED;
      }
    }
  }
}
