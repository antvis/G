import type { CSSUnitValue } from '../cssom';
import type { CSSProperty } from '../CSSProperty';
import { mergeNumberLists } from '../parser';

/**
 * used in rounded rect
 *
 * @example
 * rect.style.radius = 10;
 * rect.style.radius = '10 10';
 * rect.style.radius = '10 10 10 10';
 */
export class CSSPropertyLengthOrPercentage14
  implements
    Partial<
      CSSProperty<
        [CSSUnitValue, CSSUnitValue, CSSUnitValue, CSSUnitValue],
        [number, number, number, number]
      >
    >
{
  calculator(
    name: string,
    oldParsed: [CSSUnitValue, CSSUnitValue, CSSUnitValue, CSSUnitValue],
    computed: [CSSUnitValue, CSSUnitValue, CSSUnitValue, CSSUnitValue],
  ): [number, number, number, number] {
    return computed.map((c) => c.value) as [number, number, number, number];
  }

  mixer = mergeNumberLists;
}
