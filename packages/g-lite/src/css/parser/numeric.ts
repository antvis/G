import { clamp, isString } from '@antv/util';
import { memoize } from '../../utils/memoize';
import type { CSSUnitValue } from '../cssom';
import { getOrCreateUnitValue } from '../CSSStyleValuePool';

export function numberToString(x: number) {
  // scale(0.00000001) -> scale(0)
  // return x.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
  return x.toString();
}

/**
 * parse string or number to CSSUnitValue(numeric)
 *
 * eg.
 * * 0 -> CSSUnitValue(0)
 * * '2' -> CSSUnitValue(2)
 */
export const parseNumberUnmemoize = (string: string | number): CSSUnitValue => {
  if (typeof string === 'number') {
    return getOrCreateUnitValue(string);
  }
  if (/^\s*[-+]?(\d*\.)?\d+\s*$/.test(string)) {
    return getOrCreateUnitValue(Number(string));
  }
  return getOrCreateUnitValue(0);
};
export const parseNumber = memoize(parseNumberUnmemoize);

/**
 * separate string to array
 * eg.
 * * [0.5, 0.5] -> [CSSUnitValue, CSSUnitValue]
 */
export const parseNumberListUnmemoize = (
  string: string | number[],
): CSSUnitValue[] => {
  if (isString(string)) {
    return string.split(' ').map(parseNumberUnmemoize);
  }
  return string.map(parseNumberUnmemoize);
};
export const parseNumberList = memoize(
  (string: string | number[]): CSSUnitValue[] => {
    if (isString(string)) {
      return string.split(' ').map(parseNumber);
    }
    return string.map(parseNumber);
  },
);

export function mergeNumbers(
  left: number,
  right: number,
): [number, number, (n: number) => string] {
  return [left, right, numberToString];
}

export function clampedMergeNumbers(min: number, max: number) {
  return (
    left: number,
    right: number,
  ): [number, number, (i: number) => string] => [
    left,
    right,
    (x: number) => numberToString(clamp(x, min, max)),
  ];
}

export function mergeNumberLists(
  left: number[],
  right: number[],
): [number[], number[], (numberList: number[]) => number[]] | undefined {
  if (left.length !== right.length) {
    return;
  }
  return [
    left,
    right,
    (numberList: number[]) => {
      return numberList;
    },
  ];
}
