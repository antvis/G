import type { DisplayObject } from '../../display-objects';
import { CSSKeywordValue } from '../cssom';
import type { CSSProperty } from '../CSSProperty';

export class CSSPropertyMarker
  implements Partial<CSSProperty<DisplayObject, DisplayObject>>
{
  calculator(
    name: string,
    oldMarker: DisplayObject,
    newMarker: DisplayObject,
    object: DisplayObject,
  ) {
    // unset
    if (newMarker instanceof CSSKeywordValue) {
      newMarker = null;
    }

    const cloned = newMarker?.cloneNode(true);
    if (cloned) {
      // FIXME: SVG should not inherit parent's style, add a flag here
      cloned.style.isMarker = true;
    }

    return cloned;
  }
}
