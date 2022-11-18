import { DCHECK, DCHECK_EQ, DCHECK_NE } from '../../utils/assert';
import { CSSMathOperator } from './CSSMathOperator';
import type { CSSNumericSumValue, Term, UnitMap } from './CSSNumericSumValue';
import {
  canonicalUnitTypeForCategory,
  conversionToCanonicalUnitsScaleFactor,
  CSSStyleValue,
  CSSStyleValueType,
  unitFromName,
  unitTypeToString,
  unitTypeToUnitCategory,
} from './CSSStyleValue';
import { Nested, ParenLess, UnitType } from './types';

export type CSSNumberish = number | CSSNumericValue;

type CSSNumericBaseType =
  | 'length'
  | 'angle'
  | 'time'
  | 'frequency'
  | 'resolution'
  | 'flex'
  | 'percent';

// https://drafts.css-houdini.org/css-typed-om/#dictdef-cssnumerictype
interface CSSNumericType {
  length: number;
  angle: number;
  time: number;
  frequency: number;
  resolution: number;
  flex: number;
  percent: number;
  percentHint: CSSNumericBaseType;
}

// https://drafts.css-houdini.org/css-typed-om/#enumdef-cssnumericbasetype
export enum BaseType {
  kLength,
  kAngle,
  kTime,
  kFrequency,
  kResolution,
  kFlex,
  kPercent,
  kNumBaseTypes,
}

export function unitTypeToBaseType(unit: UnitType) {
  DCHECK_NE(unit, UnitType.kNumber);
  switch (unit) {
    case UnitType.kEms:
    // case UnitType.kExs:
    case UnitType.kPixels:
    // case UnitType.kCentimeters:
    // case UnitType.kMillimeters:
    // case UnitType.kQuarterMillimeters:
    // case UnitType.kInches:
    // case UnitType.kPoints:
    // case UnitType.kPicas:
    // case UnitType.kUserUnits:
    // case UnitType.kViewportWidth:
    // case UnitType.kViewportHeight:
    // case UnitType.kViewportInlineSize:
    // case UnitType.kViewportBlockSize:
    // case UnitType.kViewportMin:
    // case UnitType.kViewportMax:
    // case UnitType.kSmallViewportWidth:
    // case UnitType.kSmallViewportHeight:
    // case UnitType.kSmallViewportInlineSize:
    // case UnitType.kSmallViewportBlockSize:
    // case UnitType.kSmallViewportMin:
    // case UnitType.kSmallViewportMax:
    // case UnitType.kLargeViewportWidth:
    // case UnitType.kLargeViewportHeight:
    // case UnitType.kLargeViewportInlineSize:
    // case UnitType.kLargeViewportBlockSize:
    // case UnitType.kLargeViewportMin:
    // case UnitType.kLargeViewportMax:
    // case UnitType.kDynamicViewportWidth:
    // case UnitType.kDynamicViewportHeight:
    // case UnitType.kDynamicViewportInlineSize:
    // case UnitType.kDynamicViewportBlockSize:
    // case UnitType.kDynamicViewportMin:
    // case UnitType.kDynamicViewportMax:
    // case UnitType.kContainerWidth:
    // case UnitType.kContainerHeight:
    // case UnitType.kContainerInlineSize:
    // case UnitType.kContainerBlockSize:
    // case UnitType.kContainerMin:
    // case UnitType.kContainerMax:
    case UnitType.kRems:
      // case UnitType.kChs:
      return BaseType.kLength;
    case UnitType.kMilliseconds:
    case UnitType.kSeconds:
      return BaseType.kTime;
    case UnitType.kDegrees:
    case UnitType.kRadians:
    case UnitType.kGradians:
    case UnitType.kTurns:
      return BaseType.kAngle;
    // case UnitType.kHertz:
    // case UnitType.kKilohertz:
    //   return BaseType.kFrequency;
    // case UnitType.kDotsPerPixel:
    // case UnitType.kDotsPerInch:
    // case UnitType.kDotsPerCentimeter:
    //   return BaseType.kResolution;
    // case UnitType.kFraction:
    //   return BaseType.kFlex;
    case UnitType.kPercentage:
      return BaseType.kPercent;
    default:
      return BaseType.kLength;
  }
}

export function baseTypeToString(baseType: BaseType) {
  switch (baseType) {
    case BaseType.kLength:
      return 'length';
    case BaseType.kAngle:
      return 'angle';
    case BaseType.kTime:
      return 'time';
    case BaseType.kFrequency:
      return 'frequency';
    case BaseType.kResolution:
      return 'resolution';
    case BaseType.kFlex:
      return 'flex';
    case BaseType.kPercent:
      return 'percent';
    default:
      break;
  }
  return '';
}

export class CSSNumericValueType {
  private exponents: number[] = [];
  private numNonZeroEntries = 0;

  percentHint = BaseType.kPercent;
  hasPercentHint = false;

  constructor(unit: UnitType = UnitType.kNumber, exponent = 1) {
    this.exponents = new Array(BaseType.kNumBaseTypes).fill(0);
    if (unit !== UnitType.kNumber) {
      this.setExponent(unitTypeToBaseType(unit), exponent);
    }
  }

  applyPercentHint(hint: BaseType) {
    DCHECK_NE(hint, BaseType.kPercent);
    this.setExponent(
      hint,
      this.exponent(hint) + this.exponent(BaseType.kPercent),
    );
    this.setExponent(BaseType.kPercent, 0);
    this.percentHint = hint;
    this.hasPercentHint = true;
  }

  hasNonZeroEntries() {
    return this.numNonZeroEntries > 0;
  }

  isOnlyNonZeroEntry(baseType: BaseType, value: number) {
    DCHECK_NE(value, 0);
    return this.numNonZeroEntries === 1 && this.exponent(baseType) === value;
  }

  exponent(type: BaseType): number {
    return this.exponents[type];
  }

  setExponent(type: BaseType, newValue: number) {
    const oldValue = this.exponents[type];
    if (oldValue == 0 && newValue !== 0) {
      this.numNonZeroEntries++;
    } else if (oldValue !== 0 && newValue == 0) {
      this.numNonZeroEntries--;
    }
    this.exponents[type] = newValue;
  }

  static negateExponents(type: CSSNumericValueType) {
    type.exponents.forEach((v) => (v *= -1));
    return type;
  }

  matchesBaseType(baseType: BaseType) {
    DCHECK_NE(baseType, BaseType.kPercent);
    return this.isOnlyNonZeroEntry(baseType, 1) && !this.hasPercentHint;
  }

  matchesPercentage() {
    return this.isOnlyNonZeroEntry(BaseType.kPercent, 1);
  }

  matchesBaseTypePercentage(baseType: BaseType) {
    DCHECK_NE(baseType, BaseType.kPercent);
    return (
      this.isOnlyNonZeroEntry(baseType, 1) ||
      this.isOnlyNonZeroEntry(BaseType.kPercent, 1)
    );
  }

  matchesNumber() {
    return !this.hasNonZeroEntries() && !this.hasPercentHint;
  }

  matchesNumberPercentage() {
    return (
      !this.hasNonZeroEntries() || this.isOnlyNonZeroEntry(BaseType.kPercent, 1)
    );
  }

  static add(
    type1: CSSNumericValueType,
    type2: CSSNumericValueType,
    error: boolean,
  ) {
    if (
      type1.hasPercentHint &&
      type2.hasPercentHint &&
      type1.percentHint != type2.percentHint
    ) {
      error = true;
      return type1;
    }

    if (type1.hasPercentHint) type2.applyPercentHint(type1.percentHint);
    else if (type2.hasPercentHint) type1.applyPercentHint(type2.percentHint);

    DCHECK_EQ(type1.percentHint, type2.percentHint);
    // Match up base types. Try to use the percent hint to match up any
    // differences.
    for (let i = 0; i < BaseType.kNumBaseTypes; ++i) {
      const base_type: BaseType = i;
      if (type1.exponents[i] !== type2.exponents[i]) {
        if (base_type !== BaseType.kPercent) {
          type1.applyPercentHint(base_type);
          type2.applyPercentHint(base_type);
        }

        if (type1.exponents[i] !== type2.exponents[i]) {
          error = true;
          return type1;
        }
      }
    }

    error = false;
    return type1;
  }

  static multiply(
    type1: CSSNumericValueType,
    type2: CSSNumericValueType,
    error: boolean,
  ) {
    if (
      type1.hasPercentHint &&
      type2.hasPercentHint &&
      type1.percentHint != type2.percentHint
    ) {
      error = true;
      return type1;
    }

    if (type1.hasPercentHint) type2.applyPercentHint(type1.percentHint);
    else if (type2.hasPercentHint) type1.applyPercentHint(type2.percentHint);

    for (let i = 0; i < BaseType.kNumBaseTypes; ++i) {
      const base_type: BaseType = i;
      type1.setExponent(
        base_type,
        type1.exponent(base_type) + type2.exponent(base_type),
      );
    }

    error = false;
    return type1;
  }
}

const fromNumberish = (value: CSSNumberish): CSSNumericValue => {
  if (typeof value === 'number') {
    return new CSSUnitValue(value, UnitType.kNumber);
  }

  return value;
};
/**
 * CSSNumericValue is the base class for numeric and length typed CSS Values.
 * @see https://drafts.css-houdini.org/css-typed-om/#numeric-objects
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CSSNumericValue
 * @see https://chromium.googlesource.com/chromium/src/+/refs/heads/main/third_party/blink/renderer/core/css/cssom/css_numeric_value.idl
 */
export abstract class CSSNumericValue extends CSSStyleValue {
  /**
   * @see https://chromium.googlesource.com/chromium/src/+/refs/heads/main/third_party/blink/renderer/core/css/cssom/css_numeric_value.cc#296
   */

  // static fromPercentish(value: CSSNumberish): CSSNumericValue {
  //   if (typeof value === 'number') {
  //     return new CSSUnitValue(value * 100, UnitType.kPercentage);
  //   }

  //   return value;
  // }

  constructor(public type_: CSSNumericValueType) {
    super();
  }

  getType() {
    return CSSStyleValueType.kUnknownType;
  }

  // toCSSValue() {
  //   return null;
  // }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/CSSNumericValue/equals
   */
  equals(...numberishes: CSSNumberish[]) {
    const values = cssNumberishesToNumericValues(numberishes);
    return values.every((value) => this.equals(value));
  }

  /**
   * @see https://chromium.googlesource.com/chromium/src/+/refs/heads/main/third_party/blink/renderer/core/css/cssom/css_numeric_value.cc#439
   */
  add(...numberishes: CSSNumberish[]): CSSNumericValue {
    const values = cssNumberishesToNumericValues(numberishes);
    prependValueForArithmetic(CSSStyleValueType.kSumType, values, this);

    // eg. 1px + 2px = 3px
    const unitValue = maybeSimplifyAsUnitValue(values, CSSMathOperator.kAdd);
    if (unitValue) {
      return unitValue;
    }
    return CSSMathSum.create(values);
  }

  /**
   * @see https://chromium.googlesource.com/chromium/src/+/refs/heads/main/third_party/blink/renderer/core/css/cssom/css_numeric_value.cc#452
   */
  sub(...numberishes: CSSNumberish[]): CSSNumericValue {
    let values = cssNumberishesToNumericValues(numberishes);
    values = values.map((value) => value.negate());
    prependValueForArithmetic(CSSStyleValueType.kSumType, values, this);

    // eg. 3px - 2px = 1px
    const unitValue = maybeSimplifyAsUnitValue(values, CSSMathOperator.kAdd);
    if (unitValue) {
      return unitValue;
    }
    return CSSMathSum.create(values);
  }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/CSSNumericValue/mul
   */
  mul(...numberishes: CSSNumberish[]): CSSNumericValue {
    const values = cssNumberishesToNumericValues(numberishes);
    prependValueForArithmetic(CSSStyleValueType.kProductType, values, this);
    const unitValue = maybeMultiplyAsUnitValue(values);
    if (unitValue) {
      return unitValue;
    }

    return CSSMathProduct.create(values);
  }

  /**
   * eg. calc(24px / 4%)
   * @see https://developer.mozilla.org/en-US/docs/Web/API/CSSNumericValue/div
   */
  div(...numberishes: CSSNumberish[]): CSSNumericValue {
    let values = cssNumberishesToNumericValues(numberishes);
    values = values.map((value) => value.invert());
    prependValueForArithmetic(CSSStyleValueType.kProductType, values, this);

    const unitValue = maybeMultiplyAsUnitValue(values);
    if (unitValue) {
      return unitValue;
    }

    return CSSMathProduct.create(values);
  }

  min(...numberishes: CSSNumberish[]): CSSNumericValue {
    const values = cssNumberishesToNumericValues(numberishes);
    prependValueForArithmetic(CSSStyleValueType.kMinType, values, this);

    const unitValue = maybeSimplifyAsUnitValue(values, CSSMathOperator.kMin);
    if (unitValue) {
      return unitValue;
    }

    return CSSMathMin.create(values);
  }

  max(...numberishes: CSSNumberish[]): CSSNumericValue {
    const values = cssNumberishesToNumericValues(numberishes);
    prependValueForArithmetic(CSSStyleValueType.kMaxType, values, this);

    const unitValue = maybeSimplifyAsUnitValue(values, CSSMathOperator.kMax);
    if (unitValue) {
      return unitValue;
    }
    return CSSMathMax.create(values);
  }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/CSSNumericValue/to
   * @see https://chromium.googlesource.com/chromium/src/+/refs/heads/main/third_party/blink/renderer/core/css/cssom/css_numeric_value.cc#331
   */
  to(unitOrName: UnitType | string): CSSUnitValue {
    const sum = this.sumValue();
    if (sum.length === 0 || sum.length !== 1) return null;

    const value: CSSUnitValue = cssNumericSumValueEntryToUnitValue(sum[0]);
    if (!value) return null;

    let unit: UnitType;
    if (typeof unitOrName === 'string') {
      unit = unitFromName(unitOrName);
    } else {
      unit = unitOrName;
    }
    return value.convertTo(unit);
  }

  /**
   * converts the object's value to a CSSMathSum object to values of the specified unit.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/CSSNumericValue/toSum
   */
  toSum(...unit_strings: string[]): CSSMathSum {
    for (const unit_string of unit_strings) {
      if (!CSSNumericValue.isValidUnit(unitFromName(unit_string))) {
        return null;
      }
    }

    const sum = this.sumValue();
    if (!sum.length) {
      return null;
    }

    const values: CSSNumericValue[] = [];
    for (const term of sum) {
      const value = cssNumericSumValueEntryToUnitValue(term);
      if (!value) {
        return null;
      }
      values.push(value);
    }

    if (unit_strings.length === 0) {
      values.sort((a: CSSUnitValue, b: CSSUnitValue) => a.unit - b.unit);

      // We got 'values' from a sum value, so it must be a valid CSSMathSum.
      const result = CSSMathSum.create(values);
      DCHECK(!!result);
      return result;
    }

    const result: CSSNumericValue[] = [];
    for (const unit_string of unit_strings) {
      const target_unit = unitFromName(unit_string);
      DCHECK(CSSNumericValue.isValidUnit(target_unit));

      // Collect all the terms that are compatible with this unit.
      // We mark used terms as null so we don't use them again.
      const total_value = values.reduce((cur_sum, value, i) => {
        if (value) {
          const unit_value = value as CSSUnitValue;
          const converted_value = unit_value.convertTo(target_unit);
          if (converted_value) {
            cur_sum += converted_value.value;
            values[i] = null;
          }
        }
        return cur_sum;
      }, 0);

      result.push(new CSSUnitValue(total_value, target_unit));
    }

    if (values.some((v) => !!v)) {
      throw new Error('There were leftover terms that were not converted');
    }

    return CSSMathSum.create(result);
  }

  /**
   * @see https://developer.mozilla.org/en-US/docs/Web/API/CSSNumericValue/type
   * @see https://chromium.googlesource.com/chromium/src/+/refs/heads/main/third_party/blink/renderer/core/css/cssom/css_numeric_value.cc#414
   */
  type() {
    const type: CSSNumericType = {
      length: 0,
      angle: 0,
      time: 0,
      frequency: 0,
      resolution: 0,
      flex: 0,
      percent: 0,
      percentHint: 'length',
    };
    let exponent = this.type_.exponent(BaseType.kLength);
    if (exponent) {
      type.length = exponent;
    }
    exponent = this.type_.exponent(BaseType.kAngle);
    if (exponent) {
      type.angle = exponent;
    }
    exponent = this.type_.exponent(BaseType.kTime);
    if (exponent) {
      type.time = exponent;
    }
    exponent = this.type_.exponent(BaseType.kFrequency);
    if (exponent) {
      type.frequency = exponent;
    }
    exponent = this.type_.exponent(BaseType.kResolution);
    if (exponent) {
      type.resolution = exponent;
    }
    exponent = this.type_.exponent(BaseType.kFlex);
    if (exponent) {
      type.flex = exponent;
    }
    exponent = this.type_.exponent(BaseType.kPercent);
    if (exponent) {
      type.percent = exponent;
    }
    if (this.type_.hasPercentHint) {
      type.percentHint = baseTypeToString(
        this.type_.percentHint,
      ) as CSSNumericBaseType;
    }
    return type;
  }

  static isValidUnit(unit: UnitType) {
    // if (unit === UnitType.kUserUnits) return false;
    if (
      unit === UnitType.kNumber ||
      unit == UnitType.kPercentage ||
      this.isLength(unit) ||
      this.isAngle(unit) ||
      this.isTime(unit)
      // this.isFrequency(unit) ||
      // this.isResolution(unit) ||
      // this.isFlex(unit)
    )
      return true;
    return false;
  }

  abstract sumValue(): CSSNumericSumValue;

  negate(): CSSNumericValue {
    return CSSMathNegate.create(this);
  }

  invert(): CSSNumericValue {
    return CSSMathInvert.create(this);
  }

  // abstract toCalcExpressionNode(): CSSMathExpressionNode;
}

function cssNumberishesToNumericValues(
  values: CSSNumberish[],
): CSSNumericValue[] {
  return values.map(fromNumberish);
}

function prependValueForArithmetic(
  type: CSSStyleValueType,
  values: CSSNumericValue[],
  value: CSSNumericValue,
) {
  DCHECK(!!value);
  if (value.getType() === type) {
    values.unshift(...(value as unknown as CSSMathVariadic).numericValues());
  } else {
    values.unshift(value);
  }
}

function cssNumericSumValueEntryToUnitValue(term: Term) {
  if (Object.keys(term.units).length === 0) {
    return new CSSUnitValue(term.value);
  }
  if (
    Object.keys(term.units).length === 1 &&
    term.units[Object.keys(term.units)[0]] === 1
  ) {
    return new CSSUnitValue(term.value, Number(Object.keys(term.units)[0]));
  }
  return null;
}

function maybeSimplifyAsUnitValue(
  values: CSSNumericValue[],
  operator: CSSMathOperator,
) {
  DCHECK(!!values.length);

  const first_unit_value = values[0] instanceof CSSUnitValue ? values[0] : null;
  if (!first_unit_value) return null;

  let final_value = first_unit_value.value;
  for (let i = 1; i < values.length; i++) {
    const unit_value = (
      values[i] instanceof CSSUnitValue ? values[i] : null
    ) as CSSUnitValue;
    if (!unit_value || unit_value.unit !== first_unit_value.unit) return null;

    if (operator === CSSMathOperator.kAdd) {
      final_value += unit_value.value;
    } else if (operator === CSSMathOperator.kMax) {
      final_value = Math.max(final_value, unit_value.value);
    } else if (operator === CSSMathOperator.kMin) {
      final_value = Math.min(final_value, unit_value.value);
    }
  }

  return new CSSUnitValue(final_value, first_unit_value.unit);
}

function maybeMultiplyAsUnitValue(values: CSSNumericValue[]) {
  DCHECK(!!values.length);

  // We are allowed one unit value with type other than kNumber.
  let unit_other_than_number = UnitType.kNumber;

  let final_value = 1.0;
  for (let i = 0; i < values.length; i++) {
    const unit_value = (
      values[i] instanceof CSSUnitValue ? values[i] : null
    ) as CSSUnitValue;
    if (!unit_value) return null;

    if (unit_value.unit !== UnitType.kNumber) {
      if (unit_other_than_number !== UnitType.kNumber) return null;
      unit_other_than_number = unit_value.unit;
    }

    final_value *= unit_value.value;
  }

  return new CSSUnitValue(final_value, unit_other_than_number);
}

export const toCanonicalUnit = (unit: UnitType) => {
  return canonicalUnitTypeForCategory(unitTypeToUnitCategory(unit));
};

const formatInfinityOrNaN = (number: number, suffix = '') => {
  let result = '';
  if (!Number.isFinite(number)) {
    if (number > 0) result = 'infinity';
    else result = '-infinity';
  } else {
    DCHECK(Number.isNaN(number));
    result = 'NaN';
  }
  return (result += suffix);
};

const toCanonicalUnitIfPossible = (unit: UnitType) => {
  const canonical_unit = toCanonicalUnit(unit);
  if (canonical_unit === UnitType.kUnknown) return unit;
  return canonical_unit;
};

/**
 * Represents numeric values that can be expressed as a single number plus a
 * unit (or a naked number or percentage).
 * @see https://drafts.css-houdini.org/css-typed-om/#cssunitvalue
 */
export class CSSUnitValue extends CSSNumericValue {
  // static fromCSSValue(value: CSSNumericLiteralValue) {
  //   let unit = value.type;
  //   if (unit === UnitType.kInteger) unit = UnitType.kNumber;

  //   if (!this.isValidUnit(unit)) return null;

  //   return new CSSUnitValue(value.getDoubleValue(), unit);
  // }

  unit: UnitType;
  value: number;

  constructor(value: number, unitOrName: UnitType | string = UnitType.kNumber) {
    let unit: UnitType;
    if (typeof unitOrName === 'string') {
      unit = unitFromName(unitOrName);
    } else {
      unit = unitOrName;
    }

    // DCHECK(CSSUnitValue.isValidUnit(unit));

    super(new CSSNumericValueType(unit));
    this.unit = unit;
    this.value = value;
  }

  clone() {
    return new CSSUnitValue(this.value, this.unit);
  }

  convertTo(target_unit: UnitType): CSSUnitValue {
    if (this.unit === target_unit) {
      return new CSSUnitValue(this.value, this.unit);
    }

    // Instead of defining the scale factors for every unit to every other unit,
    // we simply convert to the canonical unit and back since we already have
    // the scale factors for canonical units.
    const canonical_unit = toCanonicalUnit(this.unit);
    if (
      canonical_unit !== toCanonicalUnit(target_unit) ||
      canonical_unit === UnitType.kUnknown
    ) {
      return null;
    }

    const scale_factor =
      conversionToCanonicalUnitsScaleFactor(this.unit) /
      conversionToCanonicalUnitsScaleFactor(target_unit);

    return new CSSUnitValue(this.value * scale_factor, target_unit);
  }

  equals(other: CSSNumericValue): boolean {
    const other_unit_value = other as unknown as CSSUnitValue;
    return (
      this.value === other_unit_value.value &&
      this.unit === other_unit_value.unit
    );
  }

  getType() {
    return CSSStyleValueType.kUnitType;
  }

  // toCSSValue() {
  //   return new CSSNumericLiteralValue(this.value, this.unit);
  // }
  // // const CSSPrimitiveValue* ToCSSValueWithProperty(CSSPropertyID) const final;
  // toCalcExpressionNode() {
  //   return CSSMathExpressionNumericLiteral.create(
  //     new CSSNumericLiteralValue(this.value, this.unit),
  //   );
  // }

  sumValue(): CSSNumericSumValue {
    const sum: CSSNumericSumValue = [];
    const unit_map = {} as Record<UnitType, number>;
    if (this.unit !== UnitType.kNumber) {
      unit_map[toCanonicalUnitIfPossible(this.unit)] = 1;
    }

    sum.push({
      value: this.value * conversionToCanonicalUnitsScaleFactor(this.unit),
      units: unit_map,
    });
    return sum;
  }

  negate() {
    return new CSSUnitValue(-this.value, this.unit);
  }

  invert() {
    if (this.unit === UnitType.kNumber) {
      if (this.value === 0) return null;
      return new CSSUnitValue(1.0 / this.value, this.unit);
    }
    return CSSMathInvert.create(this);
  }

  buildCSSText(n: Nested, p: ParenLess, result: string) {
    let text: string;
    switch (this.unit) {
      case UnitType.kUnknown:
        // FIXME
        break;
      case UnitType.kInteger:
        text = Number(this.value).toFixed(0);
        break;
      case UnitType.kNumber:
      case UnitType.kPercentage:
      case UnitType.kEms:
      // case UnitType.kQuirkyEms:
      // case UnitType.kExs:
      case UnitType.kRems:
      // case UnitType.kChs:
      case UnitType.kPixels:
      // case UnitType.kCentimeters:
      // case UnitType.kDotsPerPixel:
      // case UnitType.kDotsPerInch:
      // case UnitType.kDotsPerCentimeter:
      // case UnitType.kMillimeters:
      // case UnitType.kQuarterMillimeters:
      // case UnitType.kInches:
      // case UnitType.kPoints:
      // case UnitType.kPicas:
      // case UnitType.kUserUnits:
      case UnitType.kDegrees:
      case UnitType.kRadians:
      case UnitType.kGradians:
      case UnitType.kMilliseconds:
      case UnitType.kSeconds:
      // case UnitType.kHertz:
      // case UnitType.kKilohertz:
      case UnitType.kTurns: // case UnitType.kDynamicViewportMax: // case UnitType.kDynamicViewportMin: // case UnitType.kDynamicViewportBlockSize: // case UnitType.kDynamicViewportInlineSize: // case UnitType.kDynamicViewportHeight: // case UnitType.kDynamicViewportWidth: // case UnitType.kLargeViewportMax: // case UnitType.kLargeViewportMin: // case UnitType.kLargeViewportBlockSize: // case UnitType.kLargeViewportInlineSize: // case UnitType.kLargeViewportHeight: // case UnitType.kLargeViewportWidth: // case UnitType.kSmallViewportMax: // case UnitType.kSmallViewportMin: // case UnitType.kSmallViewportBlockSize: // case UnitType.kSmallViewportInlineSize: // case UnitType.kSmallViewportHeight: // case UnitType.kSmallViewportWidth: // case UnitType.kViewportMax: // case UnitType.kViewportMin: // case UnitType.kViewportBlockSize: // case UnitType.kViewportInlineSize: // case UnitType.kViewportHeight: // case UnitType.kViewportWidth: // case UnitType.kFraction:
      // case UnitType.kContainerWidth:
      // case UnitType.kContainerHeight:
      // case UnitType.kContainerInlineSize:
      // case UnitType.kContainerBlockSize:
      // case UnitType.kContainerMin:
      // case UnitType.kContainerMax: {
      {
        const kMinInteger = -999999;
        const kMaxInteger = 999999;

        const value = this.value;
        const unit = unitTypeToString(this.unit);
        if (value < kMinInteger || value > kMaxInteger) {
          const unit = unitTypeToString(this.unit);
          if (!Number.isFinite(value) || Number.isNaN(value)) {
            text = formatInfinityOrNaN(value, unit);
          } else {
            text = value + (unit || '');
          }
        } else {
          text = `${value}${unit}`;
        }
      }
    }

    result += text;
    return result;
  }
}

/**
 * The CSSMathValue interface of the CSS_Object_Model a base class for classes representing complex numeric values.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CSSMathValue
 * @see https://chromium.googlesource.com/chromium/src/+/refs/heads/main/third_party/blink/renderer/core/css/cssom/css_math_value.idl
 */
export abstract class CSSMathValue extends CSSNumericValue {
  abstract operator: string;

  // From CSSNumericValue
  isUnitValue() {
    return false;
  }

  // buildCSSText(n: Nested, p: ParenLess, s: string): string {
  //   return `calc(${s})`;
  // }

  // From CSSStyleValue
  // toCSSValue() {
  //   const node = this.toCalcExpressionNode();
  //   if (!node) return null;
  //   // return CSSMathFunctionValue.create(node);
  // }
}

export class CSSMathInvert extends CSSMathValue {
  static create(value: CSSNumericValue) {
    const type = CSSNumericValueType.negateExponents(value.type_);
    return new CSSMathInvert(value, type);
  }

  constructor(private value: CSSNumericValue, type: CSSNumericValueType) {
    super(type);
  }

  operator = 'invert';

  clone() {
    return new CSSMathInvert(this.value, this.type_);
  }

  getType() {
    return CSSStyleValueType.kInvertType;
  }

  equals(other: CSSNumericValue) {
    if (other.getType() !== CSSStyleValueType.kInvertType) {
      return false;
    }

    // We can safely cast here as we know 'other' has the same type as us.
    const other_invert = other as CSSMathInvert;
    return this.value.equals(other_invert.value);
  }

  sumValue(): CSSNumericSumValue {
    const sum = this.value.sumValue();

    if (sum.length === 0 || sum.length !== 1 || sum[0].value === 0) {
      return null;
    }

    Object.keys(sum[0].units).forEach((key) => {
      sum[0].units[key] *= -1;
    });

    sum[0].value = 1.0 / sum[0].value;
    return sum;
  }

  // toCalcExpressionNode(): CSSMathExpressionNode {
  //   const right_side = this.value.toCalcExpressionNode();
  //   if (!right_side) {
  //     return null;
  //   }

  //   // return CSSMathExpressionOperation::CreateArithmeticOperation(
  //   //   CSSMathExpressionNumericLiteral::Create(
  //   //       1, UnitType.kNumber),
  //   //   right_side, CSSMathOperator.kDivide);
  //   return null;
  // }

  buildCSSText(nested: Nested, paren_less: ParenLess, result: string): string {
    if (paren_less == ParenLess.kNo) {
      result += nested === Nested.kYes ? '(' : 'calc(';
    }

    result += '1 / ';

    result = this.value.buildCSSText(Nested.kYes, ParenLess.kNo, result);

    if (paren_less === ParenLess.kNo) {
      result += ')';
    }

    return result;
  }
}

export class CSSMathNegate extends CSSMathValue {
  static create(value: CSSNumericValue) {
    return new CSSMathNegate(value, value.type_);
  }

  constructor(public value: CSSNumericValue, type: CSSNumericValueType) {
    super(type);
  }

  operator = 'negate';

  clone() {
    return new CSSMathNegate(this.value, this.type_);
  }

  getType() {
    return CSSStyleValueType.kNegateType;
  }

  equals(other: CSSNumericValue) {
    if (other.getType() !== CSSStyleValueType.kNegateType) {
      return false;
    }

    const other_invert = other as CSSMathNegate;
    return this.value.equals(other_invert.value);
  }

  sumValue(): CSSNumericSumValue {
    const sum = this.value.sumValue();

    if (sum.length === 0) {
      return null;
    }

    sum.forEach((term) => {
      term.value *= -1;
    });

    return sum;
  }

  // toCalcExpressionNode(): CSSMathExpressionNode {
  //   const right_side = this.value.toCalcExpressionNode();
  //   if (!right_side) {
  //     return null;
  //   }

  //   // return CSSMathExpressionOperation::CreateArithmeticOperationSimplified(
  //   //   CSSMathExpressionNumericLiteral::Create(
  //   //       -1, CSSPrimitiveValue::UnitType::kNumber),
  //   //   right_side, CSSMathOperator::kMultiply);
  // }

  buildCSSText(nested: Nested, paren_less: ParenLess, result: string): string {
    if (paren_less == ParenLess.kNo) {
      result += nested === Nested.kYes ? '(' : 'calc(';
    }

    result += '-';

    result = this.value.buildCSSText(Nested.kYes, ParenLess.kNo, result);

    if (paren_less === ParenLess.kNo) {
      result += ')';
    }

    return result;
  }
}

export function typeCheck(
  values: CSSNumericValue[],
  op: (
    type1: CSSNumericValueType,
    type2: CSSNumericValueType,
    error: boolean,
  ) => CSSNumericValueType,
  error: boolean,
): CSSNumericValueType {
  error = false;

  let final_type = values[0].type_;
  for (let i = 1; i < values.length; i++) {
    final_type = op(final_type, values[i].type_, error);
    if (error) return final_type;
  }

  return final_type;
}

// Represents an arithmetic operation with one or more CSSNumericValues.
export abstract class CSSMathVariadic extends CSSMathValue {
  constructor(public values: CSSNumericValue[], type: CSSNumericValueType) {
    super(type);
  }

  numericValues() {
    return this.values;
  }

  equals(other: CSSNumericValue) {
    if (this.getType() !== other.getType()) {
      return false;
    }

    return this.values.every((value, i) =>
      value.equals((other as CSSMathVariadic).values[i]),
    );
  }

  // toCalcExporessionNodeForVariadic(op: CSSMathOperator) {
  //   let node = this.numericValues()[0].toCalcExpressionNode();
  //   if (!node) {
  //     return null;
  //   }

  //   this.numericValues().forEach((value) => {
  //     const next_arg = value.toCalcExpressionNode();
  //     if (!next_arg) {
  //       return null;
  //     }

  //     node = CSSMathExpressionOperation.createArithmeticOperation(node, next_arg, op);
  //   });

  //   return node;
  // }
}

// Represents the minimum of one or more CSSNumericValues.
// @see https://drafts.css-houdini.org/css-typed-om/#cssmathsum
export class CSSMathMin extends CSSMathVariadic {
  static create(values: CSSNumericValue[]) {
    const error = false;
    const final_type = typeCheck(values, CSSNumericValueType.add, error);
    return error ? null : new CSSMathMin(values, final_type);
  }

  operator = 'min';

  clone() {
    return new CSSMathMin(this.values, this.type_);
  }

  getType() {
    return CSSStyleValueType.kMinType;
  }

  sumValue(): CSSNumericSumValue {
    let cur_min = this.numericValues()[0].sumValue();

    if (!cur_min.length) {
      return null;
    }

    for (const value of this.numericValues()) {
      const child_sum = value.sumValue();

      if (
        !child_sum.length ||
        JSON.stringify(child_sum[0].units) !== JSON.stringify(cur_min[0].units)
      ) {
        return null;
      }

      if (child_sum[0].value < cur_min[0].value) {
        cur_min = child_sum;
      }
    }

    return cur_min;
  }

  // toCalcExpressionNode() {
  //   const operands: CSSMathExpressionOperation[] = [];

  //   for (const value of this.numericValues()) {
  //     const operand = value.toCalcExpressionNode();

  //     if (!operand) {
  //       continue;
  //     }

  //     operands.push(operand as CSSMathExpressionOperation);
  //   }

  //   return CSSMathExpressionOperation.createComparisonFunction(operands, CSSMathOperator.kMin);
  // }

  buildCSSText(nested: Nested, paren_less: ParenLess, result: string): string {
    result += 'min(';

    let first_iteration = true;
    for (const value of this.numericValues()) {
      if (!first_iteration) result += ', ';
      first_iteration = false;

      result = value.buildCSSText(Nested.kYes, ParenLess.kYes, result);
    }

    result += ')';

    return result;
  }
}

// Represents the maximum of one or more CSSNumericValues.
// @see https://drafts.css-houdini.org/css-typed-om/#cssmathsum
export class CSSMathMax extends CSSMathVariadic {
  static create(values: CSSNumericValue[]) {
    const error = false;
    const final_type = typeCheck(values, CSSNumericValueType.add, error);
    return error ? null : new CSSMathMax(values, final_type);
  }

  operator = 'max';

  clone() {
    return new CSSMathMax(this.values, this.type_);
  }

  getType() {
    return CSSStyleValueType.kMaxType;
  }

  sumValue(): CSSNumericSumValue {
    let cur_max = this.numericValues()[0].sumValue();

    if (!cur_max.length) {
      return null;
    }

    for (const value of this.numericValues()) {
      const child_sum = value.sumValue();

      if (
        !child_sum.length ||
        JSON.stringify(child_sum[0].units) !== JSON.stringify(cur_max[0].units)
      ) {
        return null;
      }

      if (child_sum[0].value < cur_max[0].value) {
        cur_max = child_sum;
      }
    }

    return cur_max;
  }

  // toCalcExpressionNode() {
  //   const operands: CSSMathExpressionOperation[] = [];

  //   for (const value of this.numericValues()) {
  //     const operand = value.toCalcExpressionNode();

  //     if (!operand) {
  //       continue;
  //     }

  //     operands.push(operand as CSSMathExpressionOperation);
  //   }

  //   return CSSMathExpressionOperation.createComparisonFunction(operands, CSSMathOperator.kMax);
  // }

  buildCSSText(nested: Nested, paren_less: ParenLess, result: string): string {
    result += 'max(';

    let first_iteration = true;
    for (const value of this.numericValues()) {
      if (!first_iteration) result += ', ';
      first_iteration = false;

      result = value.buildCSSText(Nested.kYes, ParenLess.kYes, result);
    }

    result += ')';

    return result;
  }
}

/**
 * Represents the sum of one or more CSSNumericValues.
 * @see https://drafts.css-houdini.org/css-typed-om/#cssmathsum
 */
export class CSSMathSum extends CSSMathVariadic {
  static create(values: CSSNumericValue[]) {
    const error = false;
    const finalType = typeCheck(values, CSSNumericValueType.add, error);
    return error ? null : new CSSMathSum(values, finalType);
  }

  static numericTypeFromUnitMap(units: UnitMap): CSSNumericValueType {
    let type = new CSSNumericValueType();

    Object.keys(units).forEach((key) => {
      const exp = units[key];
      const error = false;
      type = CSSNumericValueType.multiply(
        type,
        new CSSNumericValueType(Number(key), exp),
        error,
      );
      DCHECK(!error);
    });
    return type;
  }

  static canCreateNumericTypeFromSumValue(sum: CSSNumericSumValue): boolean {
    DCHECK(!!sum.length);

    const first_type = this.numericTypeFromUnitMap(sum[0].units);

    return sum.every((term) => {
      const error = false;
      CSSNumericValueType.add(
        first_type,
        this.numericTypeFromUnitMap(term.units),
        error,
      );
      return !error;
    });
  }

  operator = 'sum';

  clone() {
    return new CSSMathSum(this.values, this.type_);
  }

  getType() {
    return CSSStyleValueType.kSumType;
  }

  // toCalcExpressionNode() {
  //   return this.toCalcExporessionNodeForVariadic(CSSMathOperator.kAdd);
  // }

  sumValue(): CSSNumericSumValue {
    const sum: CSSNumericSumValue = [];
    this.numericValues().forEach((value) => {
      const child_sum = value.sumValue();

      if (!child_sum.length) {
        return null;
      }

      child_sum.forEach((term) => {
        const index = sum.findIndex(
          (s) => JSON.stringify(s.units) === JSON.stringify(term.units),
        );
        if (index === -1) {
          sum.push({ ...term });
        } else {
          sum[index].value += term.value;
        }
      });
    });

    if (!CSSMathSum.canCreateNumericTypeFromSumValue(sum)) return null;

    return sum;
  }

  buildCSSText(nested: Nested, paren_less: ParenLess, result: string): string {
    if (paren_less == ParenLess.kNo) {
      result += nested === Nested.kYes ? '(' : 'calc(';
    }

    const values = this.numericValues();
    result = values[0].buildCSSText(Nested.kYes, ParenLess.kNo, result);

    for (let i = 1; i < values.length; i++) {
      const arg = values[i];
      if (arg.getType() === CSSStyleValueType.kNegateType) {
        result += ' - ';
        result = (arg as CSSMathNegate).value.buildCSSText(
          Nested.kYes,
          ParenLess.kNo,
          result,
        );
      } else {
        result += ' + ';
        result = arg.buildCSSText(Nested.kYes, ParenLess.kNo, result);
      }
    }

    if (paren_less === ParenLess.kNo) {
      result += ')';
    }

    return result;
  }
}

/**
 * Represents the product of one or more CSSNumericValues.
 * @see https://drafts.css-houdini.org/css-typed-om/#cssmathproduct
 */
export class CSSMathProduct extends CSSMathVariadic {
  static create(values: CSSNumericValue[]) {
    const error = false;
    const finalType = typeCheck(values, CSSNumericValueType.multiply, error);
    return error ? null : new CSSMathProduct(values, finalType);
  }

  static multiplyUnitMaps(a: UnitMap, b: UnitMap): UnitMap {
    Object.keys(b).forEach((key) => {
      DCHECK_NE(b[key].value, 0);
      const old_value = key in a ? a[key].value : 0;
      if (old_value + b[key].value === 0) {
        delete a[key];
      } else {
        a[key] = old_value + b[key].value;
      }
    });
    return a;
  }

  operator = 'product';

  clone() {
    return new CSSMathProduct(this.values, this.type_);
  }

  getType() {
    return CSSStyleValueType.kProductType;
  }

  // toCalcExpressionNode() {
  //   return this.toCalcExporessionNodeForVariadic(CSSMathOperator.kMultiply);
  // }

  sumValue(): CSSNumericSumValue {
    let sum: CSSNumericSumValue = [
      {
        value: 1,
        units: {} as UnitMap,
      },
    ];
    this.numericValues().forEach((value) => {
      const child_sum = value.sumValue();

      if (!child_sum.length) {
        return null;
      }

      const new_sum: CSSNumericSumValue = [];
      sum.forEach((a) => {
        child_sum.forEach((b) => {
          new_sum.push({
            value: a.value * b.value,
            units: CSSMathProduct.multiplyUnitMaps(a.units, b.units),
          });
        });
      });
      sum = new_sum;
    });

    return sum;
  }

  buildCSSText(nested: Nested, paren_less: ParenLess, result: string): string {
    if (paren_less == ParenLess.kNo) {
      result += nested === Nested.kYes ? '(' : 'calc(';
    }

    const values = this.numericValues();
    result = values[0].buildCSSText(Nested.kYes, ParenLess.kNo, result);

    for (let i = 1; i < values.length; i++) {
      const arg = values[i];
      if (arg.getType() === CSSStyleValueType.kInvertType) {
        result += ' / ';
        result = (arg as CSSMathNegate).value.buildCSSText(
          Nested.kYes,
          ParenLess.kNo,
          result,
        );
      } else {
        result += ' * ';
        result = arg.buildCSSText(Nested.kYes, ParenLess.kNo, result);
      }
    }

    if (paren_less === ParenLess.kNo) {
      result += ')';
    }

    return result;
  }
}

export const Opx: CSSUnitValue = new CSSUnitValue(0, 'px');
export const Lpx: CSSUnitValue = new CSSUnitValue(1, 'px');
export const Odeg: CSSUnitValue = new CSSUnitValue(0, 'deg');
