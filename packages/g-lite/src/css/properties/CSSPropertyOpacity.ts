import type { CSSUnitValue } from '../cssom';
import type { CSSProperty } from '../CSSProperty';
import { clampedMergeNumbers } from '../parser/numeric';

/**
 * opacity
 */
export class CSSPropertyOpacity
  implements Partial<CSSProperty<CSSUnitValue, number>>
{
  calculator(
    name: string,
    oldParsed: CSSUnitValue,
    computed: CSSUnitValue,
  ): number {
    return computed.value;
  }

  mixer = clampedMergeNumbers(0, 1);
}
