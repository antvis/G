import type { CSSUnitValue } from '../cssom';
import type { CSSProperty } from '../CSSProperty';
import {
  clampedMergeNumbers,
  parseNumber,
  parseNumberUnmemoize,
} from '../parser/numeric';

/**
 * opacity
 */
export class CSSPropertyOpacity
  implements Partial<CSSProperty<CSSUnitValue, number>>
{
  parser = parseNumber;
  parserUnmemoize = parseNumberUnmemoize;
  parserWithCSSDisabled = null;

  calculator(
    name: string,
    oldParsed: CSSUnitValue,
    computed: CSSUnitValue,
  ): number {
    return computed.value;
  }

  mixer = clampedMergeNumbers(0, 1);
}
