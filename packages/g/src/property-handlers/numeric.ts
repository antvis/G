import { addPropertiesHandler } from '../Interpolation';

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

// FIXME: This should probably go in it's own handler.
function mergeFlex(left: number, right: number) {
  if (left == 0)
    return;
  return clampedMergeNumbers(0, Infinity)(left, right);
}

function mergePositiveIntegers(left: number, right: number) {
  return [left, right, function (x: number) {
    return Math.round(clamp(1, Infinity, x));
  }];
}

function clampedMergeNumbers(min: number, max: number) {
  return function (left: number, right: number) {
    return [left, right, function (x: number) {
      return numberToString(clamp(min, max, x));
    }];
  };
}

function parseNumberList(string: string) {
  var items = string.trim().split(/\s*[\s,]\s*/);
  if (items.length === 0) {
    return;
  }
  var result = [];
  for (var i = 0; i < items.length; i++) {
    var number = parseNumber(items[i]);
    if (number === undefined) {
      return;
    }
    result.push(number);
  }
  return result;
}

function mergeNumberLists(left: string | any[], right: string | any[]) {
  if (left.length != right.length) {
    return;
  }
  return [left, right, function (numberList: number[]) {
    return numberList.map(numberToString).join(' ');
  }];
}

function round(left: number, right: number) {
  return [left, right, Math.round];
}

addPropertiesHandler(parseNumber, clampedMergeNumbers(0, 1), ['opacity', 'fillOpacity', 'strokeOpacity', 'offsetDistance']);
addPropertiesHandler(parseNumber, clampedMergeNumbers(0, Infinity), ['r', 'lineWidth']);