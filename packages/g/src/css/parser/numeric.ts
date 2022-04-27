import { clamp, isString } from '@antv/util';
import { CSSUnitValue } from '../cssom';

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
export function parseNumber(string: string | number): CSSUnitValue {
  if (typeof string === 'number') {
    return new CSSUnitValue(string);
  }
  if (/^\s*[-+]?(\d*\.)?\d+\s*$/.test(string)) {
    return new CSSUnitValue(Number(string));
  } else {
    return new CSSUnitValue(0);
  }
}

/**
 * separate string to array
 * eg.
 * * [0.5, 0.5] -> [CSSUnitValue, CSSUnitValue]
 */
export function parseNumberList(string: string | number[]): CSSUnitValue[] {
  if (isString(string)) {
    return string.split(' ').map(parseNumber);
  } else {
    return string.map(parseNumber);
  }
}

export function mergeNumbers(
  left: CSSUnitValue,
  right: CSSUnitValue,
): [number, number, (n: number) => string] {
  return [left.value, right.value, numberToString];
}

export function clampedMergeNumbers(min: number, max: number) {
  return (left: CSSUnitValue, right: CSSUnitValue): [number, number, (i: number) => string] => [
    left.value,
    right.value,
    (x: number) => numberToString(clamp(x, min, max)),
  ];
}

export function mergeNumberLists(
  left: CSSUnitValue[],
  right: CSSUnitValue[],
): [number[], number[], (numberList: number[]) => number[]] | undefined {
  if (left.length != right.length) {
    return;
  }
  return [
    left.map((l) => l.value),
    right.map((l) => l.value),
    (numberList: number[]) => {
      return numberList;
    },
  ];
}
