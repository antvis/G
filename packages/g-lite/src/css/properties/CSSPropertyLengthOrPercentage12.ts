import type { CSSUnitValue } from '../cssom';
import type { CSSProperty } from '../CSSProperty';
import { mergeNumberLists } from '../parser';

/**
 * format to Tuple2<CSSUnitValue>
 *
 * @example
 * rect.style.lineDash = 10;
 * rect.style.lineDash = [10, 10];
 * rect.style.lineDash = '10 10';
 */
export class CSSPropertyLengthOrPercentage12
  implements
    Partial<CSSProperty<[CSSUnitValue, CSSUnitValue], [number, number]>>
{
  calculator(
    name: string,
    oldParsed: [CSSUnitValue, CSSUnitValue],
    computed: [CSSUnitValue, CSSUnitValue],
  ): [number, number] {
    return computed.map((c) => c.value) as [number, number];
  }

  mixer = mergeNumberLists;
}
