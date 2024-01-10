import type { DisplayObject } from '../../display-objects';
import type { CSSUnitValue } from '../cssom';
import type { CSSProperty } from '../CSSProperty';
import { mergeNumbers } from '../parser';
import {
  convertAngleUnit,
  parseAngle,
  parseAngleUnmemoize,
} from '../parser/dimension';
export class CSSPropertyAngle
  implements Partial<CSSProperty<CSSUnitValue, number>>
{
  parser = parseAngle;
  parserUnmemoize = parseAngleUnmemoize;
  parserWithCSSDisabled = null;

  mixer = mergeNumbers;

  calculator(
    name: string,
    oldParsed: CSSUnitValue,
    parsed: CSSUnitValue,
    object: DisplayObject,
  ) {
    return convertAngleUnit(parsed);
  }
}
