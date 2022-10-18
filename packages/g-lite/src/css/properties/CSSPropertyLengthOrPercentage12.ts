import { isNumber } from '@antv/util';
import type { CSSUnitValue } from '../cssom';
import type { CSSProperty } from '../CSSProperty';
import { mergeNumberLists } from '../parser';
import { parseDimensionArray } from '../parser/dimension';

/**
 * format to Tuple2<CSSUnitValue>
 *
 * @example
 * rect.style.lineDash = 10;
 * rect.style.lineDash = [10, 10];
 * rect.style.lineDash = '10 10';
 */
export class CSSPropertyLengthOrPercentage12
  implements Partial<CSSProperty<[CSSUnitValue, CSSUnitValue], [number, number]>>
{
  parser(radius: string | number | number[]) {
    const parsed = parseDimensionArray(isNumber(radius) ? [radius] : radius);

    let formatted: [CSSUnitValue, CSSUnitValue];
    if (parsed.length === 1) {
      formatted = [parsed[0], parsed[0]];
    } else {
      formatted = [parsed[0], parsed[1]];
    }

    return formatted;
  }

  calculator(
    name: string,
    oldParsed: [CSSUnitValue, CSSUnitValue],
    computed: [CSSUnitValue, CSSUnitValue],
  ): [number, number] {
    return computed.map((c) => c.value) as [number, number];
  }

  mixer = mergeNumberLists;
}
