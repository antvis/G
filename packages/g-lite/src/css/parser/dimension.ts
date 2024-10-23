import { isNil, isNumber, isString } from '@antv/util';
import type { DisplayObject } from '../../display-objects';
import type { IElement } from '../../dom';
import { Shape } from '../../types';
import { rad2deg, turn2deg } from '../../utils/math';
import { memoize } from '../../utils/memoize';
import { getOrCreateUnitValue } from '../CSSStyleValuePool';
import type { CSSStyleValue } from '../cssom';
import {
  CSSUnitValue,
  UnitType,
  toCanonicalUnit,
  unitTypeToString,
} from '../cssom';

type LengthUnit = 'px' | '%' | 'em' | 'rem';
type AngleUnit = 'deg' | 'rad' | 'turn';
type Unit = LengthUnit | AngleUnit | '';

export function parseDimension(
  unitRegExp: RegExp,
  string: string,
): CSSStyleValue | undefined {
  if (isNil(string)) {
    return getOrCreateUnitValue(0, 'px');
  }

  string = `${string}`.trim().toLowerCase();

  if (isFinite(Number(string))) {
    if ('px'.search(unitRegExp) >= 0) {
      return getOrCreateUnitValue(Number(string), 'px');
    }
    if ('deg'.search(unitRegExp) >= 0) {
      return getOrCreateUnitValue(Number(string), 'deg');
    }
  }

  const matchedUnits: Unit[] = [];
  string = string.replace(unitRegExp, (match: string) => {
    matchedUnits.push(match as Unit);
    return `U${match}`;
  });
  const taggedUnitRegExp = `U(${unitRegExp.source})`;

  return matchedUnits.map((unit) =>
    getOrCreateUnitValue(
      Number(
        string
          .replace(new RegExp(`U${unit}`, 'g'), '')
          .replace(new RegExp(taggedUnitRegExp, 'g'), '*0'),
      ),
      unit,
    ),
  )[0];
}

/**
 * <length>
 * @see https://developer.mozilla.org/zh-CN/docs/Web/CSS/length
 * length with only absolute unit, eg. 1px
 */
export const parseLengthUnmemoize = (css: string) => {
  return parseDimension(new RegExp('px', 'g'), css);
};
export const parseLength = memoize(parseLengthUnmemoize);

/**
 * <percentage>
 * @see https://developer.mozilla.org/zh-CN/docs/Web/CSS/percentage
 */
export const parserPercentageUnmemoize = (css: string) => {
  return parseDimension(new RegExp('%', 'g'), css);
};
export const parserPercentage = memoize(parserPercentageUnmemoize);

/**
 * length with absolute or relative unit,
 * eg. 1px, 0.7em, 50%, calc(100% - 200px);
 *
 * @see https://developer.mozilla.org/zh-CN/docs/Web/CSS/length-percentage
 */
export const parseLengthOrPercentageUnmemoize = (css: string): CSSUnitValue => {
  if (isNumber(css) || isFinite(Number(css))) {
    // Number(css) is NaN
    return getOrCreateUnitValue(Number(css) || 0, 'px');
    // return Number(css);
  }
  return parseDimension(new RegExp('px|%|em|rem', 'g'), css) as CSSUnitValue;
};
export const parseLengthOrPercentage = memoize(
  parseLengthOrPercentageUnmemoize,
);

export const parseAngleUnmemoize = (css: string): CSSUnitValue => {
  return parseDimension(
    new RegExp('deg|rad|grad|turn', 'g'),
    css,
  ) as CSSUnitValue;
};
export const parseAngle = memoize(parseAngleUnmemoize);

/**
 * merge CSSUnitValue
 *
 * @example
 * 10px + 20px = 30px
 * 10deg + 10rad
 * 10% + 20% = 30%
 */
export function mergeDimensions(
  left: CSSUnitValue,
  right: CSSUnitValue,
  target: IElement,
  nonNegative?: boolean,
  index = 0,
): [number, number, (value: number) => string] {
  let unit = '';
  let leftValue = left.value || 0;
  let rightValue = right.value || 0;

  const canonicalUnit = toCanonicalUnit(left.unit);
  const leftCanonicalUnitValue = left.convertTo(canonicalUnit);
  const rightCanonicalUnitValue = right.convertTo(canonicalUnit);

  if (leftCanonicalUnitValue && rightCanonicalUnitValue) {
    leftValue = leftCanonicalUnitValue.value;
    rightValue = rightCanonicalUnitValue.value;
    unit = unitTypeToString(left.unit);
  }
  // format '%' to 'px'
  else if (
    CSSUnitValue.isLength(left.unit) ||
    CSSUnitValue.isLength(right.unit)
  ) {
    leftValue = convertPercentUnit(left, index, target as DisplayObject);
    rightValue = convertPercentUnit(right, index, target as DisplayObject);
    unit = 'px';
  }

  return [
    leftValue,
    rightValue,
    (value: number) => {
      if (nonNegative) {
        value = Math.max(value, 0);
      }
      return value + unit;
    },
  ];
}

export function convertAngleUnit(value: CSSUnitValue) {
  let deg = 0;
  if (value.unit === UnitType.kDegrees) {
    deg = value.value;
  } else if (value.unit === UnitType.kRadians) {
    deg = rad2deg(Number(value.value));
  } else if (value.unit === UnitType.kTurns) {
    deg = turn2deg(Number(value.value));
  } else if (value.value) {
    deg = value.value;
  }
  return deg;
}

export function parseDimensionArrayFormat(
  string: string | number | (string | number)[],
  size: number,
): number[] {
  let parsed: number[];

  if (Array.isArray(string)) {
    // [1, '2px', 3]
    parsed = string.map((segment) => Number(segment));
  } else if (isString(string)) {
    parsed = string.split(' ').map((segment) => Number(segment));
  } else if (isNumber(string)) {
    parsed = [string];
  }

  if (size === 2) {
    if (parsed.length === 1) {
      return [parsed[0], parsed[0]];
    }
    return [parsed[0], parsed[1]];
  }
  if (parsed.length === 1) {
    return [parsed[0], parsed[0], parsed[0], parsed[0]];
  }
  if (parsed.length === 2) {
    return [parsed[0], parsed[1], parsed[0], parsed[1]];
  }
  if (parsed.length === 3) {
    return [parsed[0], parsed[1], parsed[2], parsed[1]];
  }
  return [parsed[0], parsed[1], parsed[2], parsed[3]];
}

export function parseDimensionArray(
  string: string | (string | number)[],
): CSSUnitValue[] {
  if (isString(string)) {
    // "1px 2px 3px"
    return string.split(' ').map((segment) => parseLengthOrPercentage(segment));
  }
  // [1, '2px', 3]
  return string.map((segment) => parseLengthOrPercentage(segment.toString()));
}
export function parseDimensionArrayUnmemoize(
  string: string | (string | number)[],
): CSSUnitValue[] {
  if (isString(string)) {
    // "1px 2px 3px"
    return string
      .split(' ')
      .map((segment) => parseLengthOrPercentageUnmemoize(segment));
  }
  // [1, '2px', 3]
  return string.map((segment) =>
    parseLengthOrPercentageUnmemoize(segment.toString()),
  );
}

// export function mergeDimensionList(
//   left: CSSUnitValue[],
//   right: CSSUnitValue[],
//   target: IElement | null,
// ): [number[], number[], (list: number[]) => string] | undefined {
//   if (left.length !== right.length) {
//     return;
//   }

//   const unit = left[0].unit;

//   return [
//     left.map((l) => l.value),
//     right.map((l) => l.value),
//     (values: number[]) => {
//       return values.map((n) => new CSSUnitValue(n, unit)).join(' ');
//     },
//   ];
// }

export function convertPercentUnit(
  valueWithUnit: CSSUnitValue,
  vec3Index: number,
  target: DisplayObject,
  useMin = false,
): number {
  if (valueWithUnit.unit === UnitType.kPixels) {
    return Number(valueWithUnit.value);
  }
  if (valueWithUnit.unit === UnitType.kPercentage && target) {
    const bounds =
      target.nodeName === Shape.GROUP
        ? target.getLocalBounds()
        : target.getGeometryBounds();
    return (
      (useMin ? bounds.min[vec3Index] : 0) +
      (valueWithUnit.value / 100) * bounds.halfExtents[vec3Index] * 2
    );
  }
  return 0;
}
