import { isString } from '@antv/util';
import type { CSSUnitValue } from '../cssom';
import { getOrCreateUnitValue } from '../CSSStyleValuePool';
import { parseLengthOrPercentage } from './dimension';
import { memoize } from '../../utils/memoize';

/**
 * @see https://developer.mozilla.org/zh-CN/docs/Web/CSS/transform-origin
 * eg. 'center' 'top left' '50px 50px'
 */
export const parseTransformOrigin = memoize(
  (value: string | number[]): [CSSUnitValue, CSSUnitValue] => {
    if (isString(value)) {
      if (value === 'text-anchor') {
        return [getOrCreateUnitValue(0, 'px'), getOrCreateUnitValue(0, 'px')];
      }

      const values = value.split(' ');
      if (values.length === 1) {
        if (values[0] === 'top' || values[0] === 'bottom') {
          // 'top' -> 'center top'
          values[1] = values[0];
          values[0] = 'center';
        } else {
          // '50px' -> '50px center'
          values[1] = 'center';
        }
      }

      if (values.length !== 2) {
        return null;
      }

      // eg. center bottom
      return [
        parseLengthOrPercentage(convertKeyword2Percent(values[0])),
        parseLengthOrPercentage(convertKeyword2Percent(values[1])),
      ];
    }
    return [
      getOrCreateUnitValue(value[0] || 0, 'px'),
      getOrCreateUnitValue(value[1] || 0, 'px'),
    ];
  },
);

function convertKeyword2Percent(keyword: string) {
  if (keyword === 'center') {
    return '50%';
  }
  if (keyword === 'left' || keyword === 'top') {
    return '0%';
  }
  if (keyword === 'right' || keyword === 'bottom') {
    return '100%';
  }
  return keyword;
}
