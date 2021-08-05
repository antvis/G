import { addPropertiesHandler } from '../utils/interpolation';

export function numberToString(x: number) {
  return x.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
}

export function clamp(min: number, max: number, x: number) {
  return Math.min(max, Math.max(min, x));
}

export function parseNumber(string: string) {
  if (/^\s*[-+]?(\d*\.)?\d+\s*$/.test(string))
    return Number(string);
}

export function mergeNumbers(left: number, right: number) {
  return [left, right, numberToString];
}

function clampedMergeNumbers(min: number, max: number) {
  return function (left: number, right: number) {
    return [left, right, function (x: number) {
      return numberToString(clamp(min, max, x));
    }];
  };
}

addPropertiesHandler(parseNumber, clampedMergeNumbers(0, 1), ['opacity', 'fillOpacity', 'strokeOpacity', 'offsetDistance']);
addPropertiesHandler(parseNumber, clampedMergeNumbers(0, Infinity), ['r', 'lineWidth', 'width', 'height']);