import { DCHECK } from '../../utils';
import type { CSSMathVariadic } from './CSSMathVariadic';
import type { CSSNumericSumValue, Term } from './CSSNumericSumValue';
import type { CSSNumericValueType } from './CSSNumericValueType';
import { CSSStyleValue } from './CSSStyleValue';
import {
  UnitType,
  CSSStyleValueType,
  BaseType,
  baseTypeToString,
  CSSUnitValue,
  CSSMathOperator,
  CSSMathInvert,
  CSSMathMax,
  CSSMathMin,
  CSSMathNegate,
  CSSMathSum,
  CSSMathProduct,
} from '.';

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
  static fromNumberish(value: CSSNumberish): CSSNumericValue {
    if (typeof value === 'number') {
      return new CSSUnitValue(value, UnitType.kNumber);
    }

    return value;
  }

  static fromPercentish(value: CSSNumberish): CSSNumericValue {
    if (typeof value === 'number') {
      return new CSSUnitValue(value * 100, UnitType.kPercentage);
    }

    return value;
  }

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
      unit = CSSUnitValue.unitFromName(unitOrName);
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
      if (!CSSNumericValue.isValidUnit(CSSNumericValue.unitFromName(unit_string))) {
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
      const target_unit = CSSNumericValue.unitFromName(unit_string);
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
      type.percentHint = baseTypeToString(this.type_.percentHint) as CSSNumericBaseType;
    }
    return type;
  }

  static isValidUnit(unit: UnitType) {
    if (unit === UnitType.kUserUnits) return false;
    if (
      unit === UnitType.kNumber ||
      unit == UnitType.kPercentage ||
      this.isLength(unit) ||
      this.isAngle(unit) ||
      this.isTime(unit) ||
      this.isFrequency(unit) ||
      this.isResolution(unit) ||
      this.isFlex(unit)
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

function cssNumberishesToNumericValues(values: CSSNumberish[]): CSSNumericValue[] {
  return values.map(CSSNumericValue.fromNumberish);
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
  if (Object.keys(term.units).length === 1 && term.units[Object.keys(term.units)[0]] === 1) {
    return new CSSUnitValue(term.value, Number(Object.keys(term.units)[0]));
  }
  return null;
}

function maybeSimplifyAsUnitValue(values: CSSNumericValue[], operator: CSSMathOperator) {
  DCHECK(!!values.length);

  const first_unit_value = values[0] instanceof CSSUnitValue ? values[0] : null;
  if (!first_unit_value) return null;

  let final_value = first_unit_value.value;
  for (let i = 1; i < values.length; i++) {
    const unit_value = (values[i] instanceof CSSUnitValue ? values[i] : null) as CSSUnitValue;
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
    const unit_value = (values[i] instanceof CSSUnitValue ? values[i] : null) as CSSUnitValue;
    if (!unit_value) return null;

    if (unit_value.unit !== UnitType.kNumber) {
      if (unit_other_than_number !== UnitType.kNumber) return null;
      unit_other_than_number = unit_value.unit;
    }

    final_value *= unit_value.value;
  }

  return new CSSUnitValue(final_value, unit_other_than_number);
}
