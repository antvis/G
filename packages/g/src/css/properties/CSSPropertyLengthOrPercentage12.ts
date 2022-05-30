import { singleton } from 'mana-syringe';
import { isNumber } from '../../utils';
import type { CSSUnitValue } from '../cssom';
import { CSSProperty } from '../CSSProperty';
import { PropertySyntax } from '../interfaces';
import { mergeDimensionList, parseDimensionArray } from '../parser/dimension';

/**
 * format to Tuple2<CSSUnitValue>
 *
 * @example
 * rect.style.lineDash = 10;
 * rect.style.lineDash = [10, 10];
 * rect.style.lineDash = '10 10';
 */
@singleton({
  token: {
    token: CSSProperty,
    named: PropertySyntax.LENGTH_PERCENTAGE_12,
  },
})
export class CSSPropertyLengthOrPercentage12
  implements Partial<CSSProperty<[CSSUnitValue, CSSUnitValue], [CSSUnitValue, CSSUnitValue]>>
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

  mixer = mergeDimensionList;
}
