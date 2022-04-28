import { DCHECK_EQ, DCHECK_NE } from '../../utils';
import { UnitType } from '.';

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
    case UnitType.kExs:
    case UnitType.kPixels:
    case UnitType.kCentimeters:
    case UnitType.kMillimeters:
    case UnitType.kQuarterMillimeters:
    case UnitType.kInches:
    case UnitType.kPoints:
    case UnitType.kPicas:
    case UnitType.kUserUnits:
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
    case UnitType.kContainerMax:
    case UnitType.kRems:
    case UnitType.kChs:
      return BaseType.kLength;
    case UnitType.kMilliseconds:
    case UnitType.kSeconds:
      return BaseType.kTime;
    case UnitType.kDegrees:
    case UnitType.kRadians:
    case UnitType.kGradians:
    case UnitType.kTurns:
      return BaseType.kAngle;
    case UnitType.kHertz:
    case UnitType.kKilohertz:
      return BaseType.kFrequency;
    case UnitType.kDotsPerPixel:
    case UnitType.kDotsPerInch:
    case UnitType.kDotsPerCentimeter:
      return BaseType.kResolution;
    case UnitType.kFraction:
      return BaseType.kFlex;
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
  private numNonZeroEntries: number = 0;

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
    this.setExponent(hint, this.exponent(hint) + this.exponent(BaseType.kPercent));
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
    return this.isOnlyNonZeroEntry(baseType, 1) || this.isOnlyNonZeroEntry(BaseType.kPercent, 1);
  }

  matchesNumber() {
    return !this.hasNonZeroEntries() && !this.hasPercentHint;
  }

  matchesNumberPercentage() {
    return !this.hasNonZeroEntries() || this.isOnlyNonZeroEntry(BaseType.kPercent, 1);
  }

  static add(type1: CSSNumericValueType, type2: CSSNumericValueType, error: boolean) {
    if (type1.hasPercentHint && type2.hasPercentHint && type1.percentHint != type2.percentHint) {
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

  static multiply(type1: CSSNumericValueType, type2: CSSNumericValueType, error: boolean) {
    if (type1.hasPercentHint && type2.hasPercentHint && type1.percentHint != type2.percentHint) {
      error = true;
      return type1;
    }

    if (type1.hasPercentHint) type2.applyPercentHint(type1.percentHint);
    else if (type2.hasPercentHint) type1.applyPercentHint(type2.percentHint);

    for (let i = 0; i < BaseType.kNumBaseTypes; ++i) {
      const base_type: BaseType = i;
      type1.setExponent(base_type, type1.exponent(base_type) + type2.exponent(base_type));
    }

    error = false;
    return type1;
  }
}
