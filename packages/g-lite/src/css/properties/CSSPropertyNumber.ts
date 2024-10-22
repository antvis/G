import type { CSSUnitValue } from '../cssom';
import type { CSSProperty } from '../CSSProperty';
import { mergeNumbers } from '../parser/numeric';

export class CSSPropertyNumber
  implements Partial<CSSProperty<CSSUnitValue, number>>
{
  mixer = mergeNumbers;
  calculator(
    name: string,
    oldParsed: CSSUnitValue,
    computed: CSSUnitValue,
  ): number {
    return computed.value;
  }
}
