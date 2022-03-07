import { numberToString } from './numeric';
import type { DisplayObject } from '../display-objects/DisplayObject';
import { rad2deg } from '../utils/math';
import { isFinite } from '@antv/util';

export type LengthUnit = 'px' | '%';
export type AngleUnit = 'deg' | 'rad' | 'turn';
export type Unit = LengthUnit | AngleUnit | '' | 'auto';
export interface ParsedElement {
  unit: Unit;
  value: number;
}

function isLengthUnit(unit: string) {
  return unit === 'px' || unit === '%';
}

function isAngleUnit(unit: string) {
  return unit === 'deg' || unit === 'rad' || unit === 'turn';
}

export function parseDimension(unitRegExp: RegExp, string: string): ParsedElement | undefined {
  if (isFinite(Number(string))) {
    return { unit: '', value: Number(string) };
  }

  string = string.trim().toLowerCase();

  if (string === '0') {
    if ('px'.search(unitRegExp) >= 0) {
      // 0 -> 0px
      return { unit: 'px', value: 0 };
    } else if ('%'.search(unitRegExp) >= 0) {
      // 0 -> 0%
      return { unit: '%', value: 0 };
    }
  } else if (string === 'auto') {
    return { unit: 'auto', value: 0 };
  }

  const matchedUnits: Unit[] = [];
  string = string.replace(unitRegExp, (match: string) => {
    matchedUnits.push(match as Unit);
    return 'U' + match;
  });
  const taggedUnitRegExp = 'U(' + unitRegExp.source + ')';

  return matchedUnits.map((unit) => ({
    unit,
    value: Number(
      string
        .replace(new RegExp('U' + unit, 'g'), '')
        .replace(new RegExp(taggedUnitRegExp, 'g'), '*0'),
    ),
  }))[0];
}

/**
 * eg. 10px + 20px = 30px
 */
export function mergeDimensions(
  left: ParsedElement,
  right: ParsedElement,
  nonNegative?: boolean,
  target: DisplayObject | null = null,
  index = 0,
): [number, number, (value: number) => string] {
  let unit = left.unit;
  let leftValue = left.value || 0;
  let rightValue = right.value || 0;

  // format '%' to 'px'
  if (isLengthUnit(left.unit) || isLengthUnit(right.unit)) {
    leftValue = convertPercentUnit(left, index, target);
    rightValue = convertPercentUnit(right, index, target);
    unit = 'px';
  }
  // format 'rad' 'turn' to 'deg'
  if (isAngleUnit(left.unit) || isAngleUnit(right.unit)) {
    leftValue = convertAngleUnit(left);
    rightValue = convertAngleUnit(right);
    unit = 'deg';
  }

  return [
    leftValue,
    rightValue,
    (value: number) => {
      if (nonNegative) {
        value = Math.max(value, 0);
      }
      return numberToString(value) + unit;
    },
  ];
}

const lengthUnits = 'px';
export const parseLength = parseDimension.bind(null, new RegExp(lengthUnits, 'g'));
export const parseLengthOrPercent = parseDimension.bind(null, new RegExp(lengthUnits + '|%', 'g'));
export const parseAngle = parseDimension.bind(null, /deg|rad|grad|turn/g);

export function parseLengthOrPercentList(list: (string | number)[]): ParsedElement[] {
  return list.map(parseLengthOrPercent);
}
// export function mergeDimensionsLists(
//   left: ParsedElement[],
//   right: ParsedElement[],
//   target: DisplayObject | null,
// ): [ParsedElement[], ParsedElement[], (list: ParsedElement[]) => string] | undefined {
//   if (left.length != right.length) {
//     return;
//   }

//   return [
//     leftValue,
//     rightValue,
//     (value: number) => {
//       if (nonNegative) {
//         value = Math.max(value, 0);
//       }
//       return numberToString(value) + unit;
//     },
//   ];
// }

export function convertPercentUnit(
  valueWithUnit: ParsedElement,
  vec3Index: number,
  target: DisplayObject | null,
): number {
  if (valueWithUnit.unit === 'px') {
    return Number(valueWithUnit.value);
  } else if (valueWithUnit.unit === '%' && target) {
    // use bounds
    const bounds = target.getBounds();
    let size = 0;
    if (bounds) {
      size = bounds.halfExtents[vec3Index] * 2;
    }
    return (Number(valueWithUnit.value) / 100) * size;
  }
  return 0;
}

export function convertAngleUnit(valueWithUnit: ParsedElement) {
  let deg = 0;
  if (valueWithUnit.unit === 'deg') {
    deg = Number(valueWithUnit.value);
  } else if (valueWithUnit.unit === 'rad') {
    deg = rad2deg(Number(valueWithUnit.value));
  } else if (valueWithUnit.unit === 'turn') {
    deg = 360 * Number(valueWithUnit.value);
  }
  return deg;
}
