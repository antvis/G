import type { CSSProperty } from '../CSSProperty';
import type { CSSUnitValue } from '../cssom';
import { parseDimensionArray, mergeDimensionList } from '../parser';
import { isNumber } from '../../utils';

/**
 * used in rounded rect
 *
 * @example
 * rect.style.radius = 10;
 * rect.style.radius = '10 10';
 * rect.style.radius = '10 10 10 10';
 */
export const CSSPropertyLengthOrPercentage14: Partial<
  CSSProperty<
    [CSSUnitValue, CSSUnitValue, CSSUnitValue, CSSUnitValue],
    [CSSUnitValue, CSSUnitValue, CSSUnitValue, CSSUnitValue]
  >
> = {
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
  },

  mixer: mergeDimensionList,
};
