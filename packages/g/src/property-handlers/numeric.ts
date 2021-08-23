import { clamp } from '@antv/util';

export function numberToString(x: number) {
  return x.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
}

export function parseNumber(string: string | number) {
  if (typeof string === 'number') {
    return string;
  }
  if (/^\s*[-+]?(\d*\.)?\d+\s*$/.test(string)) {
    return Number(string);
  } else {
    return 0;
  }
}

export function mergeNumbers(left: number, right: number) {
  return [left, right, numberToString];
}

export function clampedMergeNumbers(min: number, max: number) {
  return (left: number, right: number): [number, number, (i: number) => string] => [
    left,
    right,
    (x: number) => numberToString(clamp(x, min, max)),
  ];
}
