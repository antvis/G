import type { CSSProperty } from '../CSSProperty';
import type { CSSUnitValue } from '../cssom';
import { parseDimensionArray, mergeDimensionList } from '../parser';
import { isNumber } from '../../utils';

/**
 * format to Tuple2<CSSUnitValue>
 *
 * @example
 * rect.style.lineDash = 10;
 * rect.style.lineDash = [10, 10];
 * rect.style.lineDash = '10 10';
 */
export const CSSPropertyLengthOrPercentage12: Partial<
  CSSProperty<[CSSUnitValue, CSSUnitValue], [CSSUnitValue, CSSUnitValue]>
> = {
  parser(radius: string | number | number[]) {
    const parsed = parseDimensionArray(isNumber(radius) ? [radius] : radius);

    let formatted: [CSSUnitValue, CSSUnitValue];
    if (parsed.length === 1) {
      formatted = [parsed[0], parsed[0]];
    } else {
      formatted = [parsed[0], parsed[1]];
    }

    return formatted;
  },

  mixer: mergeDimensionList,
};
