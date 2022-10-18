import type { DisplayObject } from '../../display-objects';
import { Shape } from '../../types';
import type { CSSUnitValue } from '../cssom';
import type { CSSProperty } from '../CSSProperty';
import { clampedMergeNumbers, parseNumber } from '../parser/numeric';
export class CSSPropertyOffsetDistance implements Partial<CSSProperty<CSSUnitValue, number>> {
  parser = parseNumber;

  calculator(name: string, oldParsed: CSSUnitValue, computed: CSSUnitValue): number {
    return computed.value;
  }

  mixer = clampedMergeNumbers(0, 1);

  postProcessor(object: DisplayObject) {
    if (!object.attributes.offsetPath) {
      return;
    }

    const offsetPathNodeName = object.attributes.offsetPath.nodeName;
    if (
      offsetPathNodeName === Shape.LINE ||
      offsetPathNodeName === Shape.PATH ||
      offsetPathNodeName === Shape.POLYLINE
    ) {
      const point = object.attributes.offsetPath.getPoint(object.parsedStyle.offsetDistance);
      if (point) {
        object.setLocalPosition(point.x, point.y);
      }
    }
  }
}
