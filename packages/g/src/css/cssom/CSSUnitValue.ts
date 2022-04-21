/**
 * The CSSUnitValue interface of the CSS_Object_Model represents values that contain a single unit type.
 * For example, "42px" would be represented by a CSSNumericValue.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CSSUnitValue
 */

import { DCHECK } from '../../utils';
import { CSSMathInvert } from './CSSMathInvert';
import type { CSSNumericSumValue } from './CSSNumericSumValue';
import type { Nested, ParenLess } from '.';
import { CSSNumericValue } from './CSSNumericValue';
import { CSSNumericValueType } from './CSSNumericValueType';
import { CSSStyleValueType, UnitType } from '.';
import { CSSStyleValue } from './CSSStyleValue';

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

  static toCanonicalUnit(unit: UnitType) {
    return this.canonicalUnitTypeForCategory(this.unitTypeToUnitCategory(unit));
  }

  static toCanonicalUnitIfPossible(unit: UnitType) {
    const canonical_unit = this.toCanonicalUnit(unit);
    if (canonical_unit === UnitType.kUnknown) return unit;
    return canonical_unit;
  }

  static formatInfinityOrNaN(number: number, suffix: string = '') {
    let result = '';
    if (!Number.isFinite(number)) {
      if (number > 0) result = 'infinity';
      else result = '-infinity';
    } else {
      DCHECK(Number.isNaN(number));
      result = 'NaN';
    }
    return (result += suffix);
  }

  static formatNumber(number: number, suffix: string = '') {
    return number + suffix;
  }

  unit: UnitType;
  value: number;

  constructor(value: number, unitOrName: UnitType | string = UnitType.kNumber) {
    let unit: UnitType;
    if (typeof unitOrName === 'string') {
      unit = CSSUnitValue.unitFromName(unitOrName);
    } else {
      unit = unitOrName;
    }

    DCHECK(CSSUnitValue.isValidUnit(unit));

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
    const canonical_unit = CSSUnitValue.toCanonicalUnit(this.unit);
    if (
      canonical_unit !== CSSUnitValue.toCanonicalUnit(target_unit) ||
      canonical_unit === UnitType.kUnknown
    ) {
      return null;
    }

    const scale_factor =
      CSSStyleValue.conversionToCanonicalUnitsScaleFactor(this.unit) /
      CSSStyleValue.conversionToCanonicalUnitsScaleFactor(target_unit);

    return new CSSUnitValue(this.value * scale_factor, target_unit);
  }

  equals(other: CSSNumericValue): boolean {
    const other_unit_value = other as unknown as CSSUnitValue;
    return this.value === other_unit_value.value && this.unit === other_unit_value.unit;
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
      unit_map[CSSUnitValue.toCanonicalUnitIfPossible(this.unit)] = 1;
    }

    sum.push({
      value: this.value * CSSStyleValue.conversionToCanonicalUnitsScaleFactor(this.unit),
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
      case UnitType.kQuirkyEms:
      case UnitType.kExs:
      case UnitType.kRems:
      case UnitType.kChs:
      case UnitType.kPixels:
      case UnitType.kCentimeters:
      case UnitType.kDotsPerPixel:
      case UnitType.kDotsPerInch:
      case UnitType.kDotsPerCentimeter:
      case UnitType.kMillimeters:
      case UnitType.kQuarterMillimeters:
      case UnitType.kInches:
      case UnitType.kPoints:
      case UnitType.kPicas:
      case UnitType.kUserUnits:
      case UnitType.kDegrees:
      case UnitType.kRadians:
      case UnitType.kGradians:
      case UnitType.kMilliseconds:
      case UnitType.kSeconds:
      case UnitType.kHertz:
      case UnitType.kKilohertz:
      case UnitType.kTurns:
      case UnitType.kFraction:
      case UnitType.kViewportWidth:
      case UnitType.kViewportHeight:
      case UnitType.kViewportInlineSize:
      case UnitType.kViewportBlockSize:
      case UnitType.kViewportMin:
      case UnitType.kViewportMax:
      case UnitType.kSmallViewportWidth:
      case UnitType.kSmallViewportHeight:
      case UnitType.kSmallViewportInlineSize:
      case UnitType.kSmallViewportBlockSize:
      case UnitType.kSmallViewportMin:
      case UnitType.kSmallViewportMax:
      case UnitType.kLargeViewportWidth:
      case UnitType.kLargeViewportHeight:
      case UnitType.kLargeViewportInlineSize:
      case UnitType.kLargeViewportBlockSize:
      case UnitType.kLargeViewportMin:
      case UnitType.kLargeViewportMax:
      case UnitType.kDynamicViewportWidth:
      case UnitType.kDynamicViewportHeight:
      case UnitType.kDynamicViewportInlineSize:
      case UnitType.kDynamicViewportBlockSize:
      case UnitType.kDynamicViewportMin:
      case UnitType.kDynamicViewportMax:
      case UnitType.kContainerWidth:
      case UnitType.kContainerHeight:
      case UnitType.kContainerInlineSize:
      case UnitType.kContainerBlockSize:
      case UnitType.kContainerMin:
      case UnitType.kContainerMax: {
        const kMinInteger = -999999;
        const kMaxInteger = 999999;

        const value = this.value;
        const unit = CSSUnitValue.unitTypeToString(this.unit);
        if (value < kMinInteger || value > kMaxInteger) {
          const unit = CSSUnitValue.unitTypeToString(this.unit);
          if (!Number.isFinite(value) || Number.isNaN(value)) {
            text = CSSUnitValue.formatInfinityOrNaN(value, unit);
          } else {
            text = CSSUnitValue.formatNumber(value, unit);
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
