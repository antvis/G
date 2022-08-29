import { isNumber } from '@antv/util';
import { singleton } from 'mana-syringe';
import type { CSSUnitValue } from '../cssom';
import { CSSProperty } from '../CSSProperty';
import { PropertySyntax } from '../interfaces';
import { mergeNumberLists } from '../parser';
import { parseDimensionArray } from '../parser/dimension';

/**
 * used in rounded rect
 *
 * @example
 * rect.style.radius = 10;
 * rect.style.radius = '10 10';
 * rect.style.radius = '10 10 10 10';
 */
@singleton({
  token: {
    token: CSSProperty,
    named: PropertySyntax.LENGTH_PERCENTAGE_14,
  },
})
export class CSSPropertyLengthOrPercentage14
  implements
    Partial<
      CSSProperty<
        [CSSUnitValue, CSSUnitValue, CSSUnitValue, CSSUnitValue],
        [number, number, number, number]
      >
    >
{
  parser(radius: string | number | number[]) {
    const parsed = parseDimensionArray(isNumber(radius) ? [radius] : radius);

    let formatted: [CSSUnitValue, CSSUnitValue, CSSUnitValue, CSSUnitValue];
    // format to Tuple<CSSUnitValue>
    if (parsed.length === 1) {
      formatted = [parsed[0], parsed[0], parsed[0], parsed[0]];
    } else if (parsed.length === 2) {
      formatted = [parsed[0], parsed[1], parsed[0], parsed[1]];
    } else if (parsed.length === 3) {
      formatted = [parsed[0], parsed[1], parsed[2], parsed[1]];
    } else {
      formatted = [parsed[0], parsed[1], parsed[2], parsed[3]];
    }

    return formatted;
  }

  calculator(
    name: string,
    oldParsed: [CSSUnitValue, CSSUnitValue, CSSUnitValue, CSSUnitValue],
    computed: [CSSUnitValue, CSSUnitValue, CSSUnitValue, CSSUnitValue],
  ): [number, number, number, number] {
    return computed.map((c) => c.value) as [number, number, number, number];
  }

  mixer = mergeNumberLists;
}
