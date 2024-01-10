import type { CSSUnitValue } from '../cssom';
import type { CSSProperty } from '../CSSProperty';
import {
  mergeNumbers,
  parseNumber,
  parseNumberUnmemoize,
} from '../parser/numeric';

export class CSSPropertyNumber
  implements Partial<CSSProperty<CSSUnitValue, number>>
{
  mixer = mergeNumbers;
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
}
