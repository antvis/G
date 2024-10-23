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

export type CSSNumberish = number;

const formatInfinityOrNaN = (number: number, suffix = '') => {
  let result = '';
  if (!Number.isFinite(number)) {
    if (number > 0) result = 'infinity';
    else result = '-infinity';
  } else {
    result = 'NaN';
  }
  return (result += suffix);
};

export const toCanonicalUnit = (unit: UnitType) => {
  return canonicalUnitTypeForCategory(unitTypeToUnitCategory(unit));
};

/**
 * CSSNumericValue is the base class for numeric and length typed CSS Values.
 * @see https://drafts.css-houdini.org/css-typed-om/#numeric-objects
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CSSNumericValue
 * @see https://chromium.googlesource.com/chromium/src/+/refs/heads/main/third_party/blink/renderer/core/css/cssom/css_numeric_value.idl
 */

/**
 * Represents numeric values that can be expressed as a single number plus a
 * unit (or a naked number or percentage).
 * @see https://drafts.css-houdini.org/css-typed-om/#cssunitvalue
 */
export class CSSUnitValue extends CSSStyleValue {
  unit: UnitType;
  value: number;

  constructor(value: number, unitOrName: UnitType | string = UnitType.kNumber) {
    super();

    let unit: UnitType;
    if (typeof unitOrName === 'string') {
      unit = unitFromName(unitOrName);
    } else {
      unit = unitOrName;
    }
    this.unit = unit;
    this.value = value;
  }

  clone() {
    return new CSSUnitValue(this.value, this.unit);
  }

  equals(other: CSSUnitValue): boolean {
    const other_unit_value = other as unknown as CSSUnitValue;
    return (
      this.value === other_unit_value.value &&
      this.unit === other_unit_value.unit
    );
  }

  getType() {
    return CSSStyleValueType.kUnitType;
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
      case UnitType.kTurns: {
        // case UnitType.kContainerMax: { // case UnitType.kContainerMin: // case UnitType.kContainerBlockSize: // case UnitType.kContainerInlineSize: // case UnitType.kContainerHeight: // case UnitType.kContainerWidth: // case UnitType.kDynamicViewportMax: // case UnitType.kDynamicViewportMin: // case UnitType.kDynamicViewportBlockSize: // case UnitType.kDynamicViewportInlineSize: // case UnitType.kDynamicViewportHeight: // case UnitType.kDynamicViewportWidth: // case UnitType.kLargeViewportMax: // case UnitType.kLargeViewportMin: // case UnitType.kLargeViewportBlockSize: // case UnitType.kLargeViewportInlineSize: // case UnitType.kLargeViewportHeight: // case UnitType.kLargeViewportWidth: // case UnitType.kSmallViewportMax: // case UnitType.kSmallViewportMin: // case UnitType.kSmallViewportBlockSize: // case UnitType.kSmallViewportInlineSize: // case UnitType.kSmallViewportHeight: // case UnitType.kSmallViewportWidth: // case UnitType.kViewportMax: // case UnitType.kViewportMin: // case UnitType.kViewportBlockSize: // case UnitType.kViewportInlineSize: // case UnitType.kViewportHeight: // case UnitType.kViewportWidth: // case UnitType.kFraction:
        const kMinInteger = -999999;
        const kMaxInteger = 999999;

        const { value } = this;
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

export const Opx: CSSUnitValue = new CSSUnitValue(0, 'px');
export const Lpx: CSSUnitValue = new CSSUnitValue(1, 'px');
export const Odeg: CSSUnitValue = new CSSUnitValue(0, 'deg');
