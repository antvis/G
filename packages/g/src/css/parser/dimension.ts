import type { DisplayObject } from '../../display-objects';
import type { IElement } from '../../dom';
import { AABB } from '../../shapes';
import { isNil, isString, rad2deg, turn2deg } from '../../utils';
import type { CSSStyleValue } from '../cssom';
import { CSSUnitValue, UnitType } from '../cssom';

type LengthUnit = 'px' | '%' | 'em' | 'rem';
type AngleUnit = 'deg' | 'rad' | 'turn';
type Unit = LengthUnit | AngleUnit | '';

export function parseDimension(unitRegExp: RegExp, string: string): CSSStyleValue | undefined {
  if (isNil(string)) {
    return new CSSUnitValue(0, 'px');
  }

  string = `${string}`.trim().toLowerCase();

  if (isFinite(Number(string))) {
    if ('px'.search(unitRegExp) >= 0) {
      return new CSSUnitValue(Number(string), 'px');
    } else if ('deg'.search(unitRegExp) >= 0) {
      return new CSSUnitValue(Number(string), 'deg');
    }
  }

  const matchedUnits: Unit[] = [];
  string = string.replace(unitRegExp, (match: string) => {
    matchedUnits.push(match as Unit);
    return 'U' + match;
  });
  const taggedUnitRegExp = 'U(' + unitRegExp.source + ')';

  return matchedUnits.map(
    (unit) =>
      new CSSUnitValue(
        Number(
          string
            .replace(new RegExp('U' + unit, 'g'), '')
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
export function parseLength(css: string) {
  return parseDimension(new RegExp('px', 'g'), css);
}

/**
 * <percentage>
 * @see https://developer.mozilla.org/zh-CN/docs/Web/CSS/percentage
 */
export function parserPercentage(css: string) {
  return parseDimension(new RegExp('%', 'g'), css);
}

/**
 * length with absolute or relative unit,
 * eg. 1px, 0.7em, 50%, calc(100% - 200px);
 *
 * @see https://developer.mozilla.org/zh-CN/docs/Web/CSS/length-percentage
 */
export function parseLengthOrPercentage(css: string): CSSUnitValue {
  return parseDimension(new RegExp('px|%|em|rem', 'g'), css) as CSSUnitValue;
}

export function parseAngle(css: string): CSSUnitValue {
  return parseDimension(new RegExp('deg|rad|grad|turn', 'g'), css) as CSSUnitValue;
}

/**
 * merge CSSUnitValue
 *
 * @example
 * 10px + 20px = 30px
 * 10deg + 10rad
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

  // const canonicalUnit = CSSUnitValue.toCanonicalUnit(left.unit);

  // const leftCanonicalUnitValue = left.convertTo(canonicalUnit);
  // const rightCanonicalUnitValue = right.convertTo(canonicalUnit);

  // format '%' to 'px'
  if (CSSUnitValue.isLength(left.unit) || CSSUnitValue.isLength(right.unit)) {
    leftValue = convertPercentUnit(left, index, target as DisplayObject);
    rightValue = convertPercentUnit(right, index, target as DisplayObject);
    unit = 'px';
  }
  // format 'rad' 'turn' to 'deg'
  if (CSSUnitValue.isAngle(left.unit) || CSSUnitValue.isAngle(right.unit)) {
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
  }
  return deg;
}

export function parseDimensionArray(string: string | (string | number)[]): CSSUnitValue[] {
  if (isString(string)) {
    // "1px 2px 3px"
    return string.split(' ').map((segment) => parseLengthOrPercentage(segment));
  } else {
    // [1, '2px', 3]
    return string.map((segment) => parseLengthOrPercentage(segment.toString()));
  }
}

export function mergeDimensionList(
  left: CSSUnitValue[],
  right: CSSUnitValue[],
  target: IElement | null,
): [number[], number[], (list: number[]) => string] | undefined {
  if (left.length !== right.length) {
    return;
  }

  const unit = left[0].unit;

  return [
    left.map((l) => l.value),
    right.map((l) => l.value),
    (values: number[]) => {
      return values.map((n) => new CSSUnitValue(n, unit)).join(' ');
    },
  ];
}

export function convertPercentUnit(
  valueWithUnit: CSSUnitValue,
  vec3Index: number,
  target: DisplayObject,
): number {
  if (valueWithUnit.unit === UnitType.kPixels) {
    return Number(valueWithUnit.value);
  } else if (valueWithUnit.unit === UnitType.kPercentage && target) {
    // use bounds
    const bounds = target.getGeometryBounds();
    let size = 0;
    if (!AABB.isEmpty(bounds)) {
      size = bounds.halfExtents[vec3Index] * 2;
    }
    return (Number(valueWithUnit.value) / 100) * size;
  }
  return 0;
}
