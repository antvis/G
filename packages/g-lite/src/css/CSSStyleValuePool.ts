import { memoize } from '../utils/memoize';
import { CSSKeywordValue, CSSRGB, CSSUnitValue, UnitType } from './cssom';

/**
 * CSSKeywordValue
 */
export const unsetKeywordValue = new CSSKeywordValue('unset');
export const initialKeywordValue = new CSSKeywordValue('initial');
export const inheritKeywordValue = new CSSKeywordValue('inherit');
const keywordCache: Record<string, CSSKeywordValue> = {
  '': unsetKeywordValue,
  unset: unsetKeywordValue,
  initial: initialKeywordValue,
  inherit: inheritKeywordValue,
};
export const getOrCreateKeyword = (name: string) => {
  if (!keywordCache[name]) {
    keywordCache[name] = new CSSKeywordValue(name);
  }

  return keywordCache[name];
};

/**
 * CSSColor
 */
export const noneColor = new CSSRGB(0, 0, 0, 0, true);
export const transparentColor = new CSSRGB(0, 0, 0, 0);
export const getOrCreateRGBA = memoize(
  (r: number, g: number, b: number, a: number) => {
    return new CSSRGB(r, g, b, a);
  },
  (r: number, g: number, b: number, a: number) => {
    return `rgba(${r},${g},${b},${a})`;
  },
);

// export const getOrCreateUnitValue = memoize(
//   (value: number, unitOrName: UnitType | string = UnitType.kNumber) => {
//     return new CSSUnitValue(value, unitOrName);
//   },
//   (value: number, unitOrName: UnitType | string = UnitType.kNumber) => {
//     return `${value}${unitOrName}`;
//   },
// );

export const getOrCreateUnitValue = (
  value: number,
  unitOrName: UnitType | string = UnitType.kNumber,
) => {
  return new CSSUnitValue(value, unitOrName);
};
export const PECENTAGE_50 = new CSSUnitValue(50, '%');
