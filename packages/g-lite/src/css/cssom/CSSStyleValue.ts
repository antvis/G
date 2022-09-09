import { Nested, ParenLess, UnitCategory, UnitType } from './types';

// This file specifies the unit strings used in CSSPrimitiveValues.
const data = [
  {
    name: 'em',
    unit_type: UnitType.kEms,
  },
  // {
  //   name: 'ex',
  //   unit_type: UnitType.kExs,
  // },
  {
    name: 'px',
    unit_type: UnitType.kPixels,
  },
  // {
  //   name: "cm",
  //   unit_type: UnitType.kCentimeters,
  // },
  // {
  //   name: "mm",
  //   unit_type: UnitType.kMillimeters,
  // },
  // {
  //   name: "q",
  //   unit_type: UnitType.kQuarterMillimeters,
  // },
  // {
  //   name: "in",
  //   unit_type: UnitType.kInches,
  // },
  // {
  //   name: "pt",
  //   unit_type: UnitType.kPoints,
  // },
  // {
  //   name: "pc",
  //   unit_type: UnitType.kPicas,
  // },
  {
    name: 'deg',
    unit_type: UnitType.kDegrees,
  },
  {
    name: 'rad',
    unit_type: UnitType.kRadians,
  },
  {
    name: 'grad',
    unit_type: UnitType.kGradians,
  },
  {
    name: 'ms',
    unit_type: UnitType.kMilliseconds,
  },
  {
    name: 's',
    unit_type: UnitType.kSeconds,
  },
  // {
  //   name: "hz",
  //   unit_type: UnitType.kHertz,
  // },
  // {
  //   name: "khz",
  //   unit_type: UnitType.kKilohertz,
  // },
  // {
  //   name: "dpi",
  //   unit_type: "kDotsPerInch",
  // },
  // {
  //   name: "dpcm",
  //   unit_type: "kDotsPerCentimeter",
  // },
  // {
  //   name: "dppx",
  //   unit_type: "kDotsPerPixel",
  // },
  // {
  //   name: "x",
  //   unit_type: "kDotsPerPixel",
  // },
  // {
  //   name: "vw",
  //   unit_type: "kViewportWidth",
  // },
  // {
  //   name: "vh",
  //   unit_type: "kViewportHeight",
  // },
  // {
  //   name: "vi",
  //   unit_type: "kViewportInlineSize",
  // },
  // {
  //   name: "vb",
  //   unit_type: "kViewportBlockSize",
  // },
  // {
  //   name: "vmin",
  //   unit_type: UnitType.kViewportMin,
  // },
  // {
  //   name: "vmax",
  //   unit_type: UnitType.kViewportMax,
  // },
  // {
  //   name: "svw",
  //   unit_type: "kSmallViewportWidth",
  // },
  // {
  //   name: "svh",
  //   unit_type: "kSmallViewportHeight",
  // },
  // {
  //   name: "svi",
  //   unit_type: "kSmallViewportInlineSize",
  // },
  // {
  //   name: "svb",
  //   unit_type: "kSmallViewportBlockSize",
  // },
  // {
  //   name: "svmin",
  //   unit_type: "kSmallViewportMin",
  // },
  // {
  //   name: "svmax",
  //   unit_type: "kSmallViewportMax",
  // },
  // {
  //   name: "lvw",
  //   unit_type: "kLargeViewportWidth",
  // },
  // {
  //   name: "lvh",
  //   unit_type: "kLargeViewportHeight",
  // },
  // {
  //   name: "lvi",
  //   unit_type: "kLargeViewportInlineSize",
  // },
  // {
  //   name: "lvb",
  //   unit_type: "kLargeViewportBlockSize",
  // },
  // {
  //   name: "lvmin",
  //   unit_type: UnitType.kLargeViewportMin,
  // },
  // {
  //   name: "lvmax",
  //   unit_type: UnitType.kLargeViewportMax,
  // },
  // {
  //   name: "dvw",
  //   unit_type: UnitType.kDynamicViewportWidth,
  // },
  // {
  //   name: "dvh",
  //   unit_type: UnitType.kDynamicViewportHeight,
  // },
  // {
  //   name: "dvi",
  //   unit_type: UnitType.kDynamicViewportInlineSize,
  // },
  // {
  //   name: "dvb",
  //   unit_type: UnitType.kDynamicViewportBlockSize,
  // },
  // {
  //   name: "dvmin",
  //   unit_type: UnitType.kDynamicViewportMin,
  // },
  // {
  //   name: "dvmax",
  //   unit_type: UnitType.kDynamicViewportMax,
  // },
  // {
  //   name: "cqw",
  //   unit_type: UnitType.kContainerWidth,
  // },
  // {
  //   name: "cqh",
  //   unit_type: UnitType.kContainerHeight,
  // },
  // {
  //   name: "cqi",
  //   unit_type: UnitType.kContainerInlineSize,
  // },
  // {
  //   name: "cqb",
  //   unit_type: UnitType.kContainerBlockSize,
  // },
  // {
  //   name: "cqmin",
  //   unit_type: UnitType.kContainerMin,
  // },
  // {
  //   name: "cqmax",
  //   unit_type: UnitType.kContainerMax,
  // },
  {
    name: 'rem',
    unit_type: UnitType.kRems,
  },
  // {
  //   name: 'fr',
  //   unit_type: UnitType.kFraction,
  // },
  {
    name: 'turn',
    unit_type: UnitType.kTurns,
  },
  // {
  //   name: 'ch',
  //   unit_type: UnitType.kChs,
  // },
  // {
  //   name: '__qem',
  //   unit_type: UnitType.kQuirkyEms,
  // },
];

export enum CSSStyleValueType {
  kUnknownType,
  kUnparsedType,
  kKeywordType,
  // Start of CSSNumericValue subclasses
  kUnitType,
  kSumType,
  kProductType,
  kNegateType,
  kInvertType,
  kMinType,
  kMaxType,
  kClampType,
  // End of CSSNumericValue subclasses
  kTransformType,
  kPositionType,
  kURLImageType,
  kColorType,
  kUnsupportedColorType,
}

// function parseCSSStyleValue(propertyName: string, value: string): CSSStyleValue[] {
//   // const propertyId = cssPropertyID(propertyName);

//   // if (propertyId === CSSPropertyID.kInvalid) {
//   //   return [];
//   // }

//   // const customPropertyName = propertyId === CSSPropertyID.kVariable ? propertyName : null;
//   // return fromString(propertyId, customPropertyName, value);
//   return [];
// }

const stringToUnitType = (name: string): UnitType => {
  return data.find((item) => item.name === name).unit_type;
};

export const unitFromName = (name: string) => {
  if (!name) {
    return UnitType.kUnknown;
  }
  if (name === 'number') {
    return UnitType.kNumber;
  }
  if (name === 'percent' || name === '%') {
    return UnitType.kPercentage;
  }
  return stringToUnitType(name);
};

export const unitTypeToUnitCategory = (type: UnitType) => {
  switch (type) {
    case UnitType.kNumber:
    case UnitType.kInteger:
      return UnitCategory.kUNumber;
    case UnitType.kPercentage:
      return UnitCategory.kUPercent;
    case UnitType.kPixels:
      // case UnitType.kCentimeters:
      // case UnitType.kMillimeters:
      // case UnitType.kQuarterMillimeters:
      // case UnitType.kInches:
      // case UnitType.kPoints:
      // case UnitType.kPicas:
      // case UnitType.kUserUnits:
      return UnitCategory.kULength;
    case UnitType.kMilliseconds:
    case UnitType.kSeconds:
      return UnitCategory.kUTime;
    case UnitType.kDegrees:
    case UnitType.kRadians:
    case UnitType.kGradians:
    case UnitType.kTurns:
      return UnitCategory.kUAngle;
    // case UnitType.kHertz:
    // case UnitType.kKilohertz:
    //   return UnitCategory.kUFrequency;
    // case UnitType.kDotsPerPixel:
    // case UnitType.kDotsPerInch:
    // case UnitType.kDotsPerCentimeter:
    //   return UnitCategory.kUResolution;
    default:
      return UnitCategory.kUOther;
  }
};

export const canonicalUnitTypeForCategory = (category: UnitCategory) => {
  // The canonical unit type is chosen according to the way
  // CSSPropertyParser.ValidUnit() chooses the default unit in each category
  // (based on unitflags).
  switch (category) {
    case UnitCategory.kUNumber:
      return UnitType.kNumber;
    case UnitCategory.kULength:
      return UnitType.kPixels;
    case UnitCategory.kUPercent:
      return UnitType.kPercentage;
    // return UnitType.kUnknown; // Cannot convert between numbers and percent.
    case UnitCategory.kUTime:
      return UnitType.kSeconds;
    case UnitCategory.kUAngle:
      return UnitType.kDegrees;
    // case UnitCategory.kUFrequency:
    //   return UnitType.kHertz;
    // case UnitCategory.kUResolution:
    //   return UnitType.kDotsPerPixel;
    default:
      return UnitType.kUnknown;
  }
};

/**
 * @see https://chromium.googlesource.com/chromium/src/+/refs/heads/main/third_party/blink/renderer/core/css/css_primitive_value.cc#353
 */
export const conversionToCanonicalUnitsScaleFactor = (unit_type: UnitType) => {
  let factor = 1.0;
  // FIXME: the switch can be replaced by an array of scale factors.
  switch (unit_type) {
    // These are "canonical" units in their respective categories.
    case UnitType.kPixels:
    // case UnitType.kUserUnits:
    case UnitType.kDegrees:
    case UnitType.kSeconds:
      // case UnitType.kHertz:
      break;
    case UnitType.kMilliseconds:
      factor = 0.001;
      break;
    // case UnitType.kCentimeters:
    //   // factor = kCssPixelsPerCentimeter;
    //   break;
    // case UnitType.kDotsPerCentimeter:
    //   // factor = 1 / kCssPixelsPerCentimeter;
    //   break;
    // case UnitType.kMillimeters:
    //   // factor = kCssPixelsPerMillimeter;
    //   break;
    // case UnitType.kQuarterMillimeters:
    //   // factor = kCssPixelsPerQuarterMillimeter;
    //   break;
    // case UnitType.kInches:
    //   // factor = kCssPixelsPerInch;
    //   break;
    // case UnitType.kDotsPerInch:
    //   // factor = 1 / kCssPixelsPerInch;
    //   break;
    // case UnitType.kPoints:
    //   // factor = kCssPixelsPerPoint;
    //   break;
    // case UnitType.kPicas:
    //   // factor = kCssPixelsPerPica;
    //   break;
    case UnitType.kRadians:
      factor = 180 / Math.PI;
      break;
    case UnitType.kGradians:
      factor = 0.9;
      break;
    case UnitType.kTurns:
      factor = 360;
      break;
    // case UnitType.kKilohertz:
    //   factor = 1000;
    //   break;
    default:
      break;
  }
  return factor;
};

export const unitTypeToString = (type: UnitType) => {
  switch (type) {
    case UnitType.kNumber:
    case UnitType.kInteger:
      // case UnitType.kUserUnits:
      return '';
    case UnitType.kPercentage:
      return '%';
    case UnitType.kEms:
      // case UnitType.kQuirkyEms:
      return 'em';
    // case UnitType.kExs:
    //   return 'ex';
    case UnitType.kRems:
      return 'rem';
    // case UnitType.kChs:
    //   return 'ch';
    case UnitType.kPixels:
      return 'px';
    // case UnitType.kCentimeters:
    //   return 'cm';
    // case UnitType.kDotsPerPixel:
    //   return 'dppx';
    // case UnitType.kDotsPerInch:
    //   return 'dpi';
    // case UnitType.kDotsPerCentimeter:
    //   return 'dpcm';
    // case UnitType.kMillimeters:
    //   return 'mm';
    // case UnitType.kQuarterMillimeters:
    //   return 'q';
    // case UnitType.kInches:
    //   return 'in';
    // case UnitType.kPoints:
    //   return 'pt';
    // case UnitType.kPicas:
    //   return 'pc';
    case UnitType.kDegrees:
      return 'deg';
    case UnitType.kRadians:
      return 'rad';
    case UnitType.kGradians:
      return 'grad';
    case UnitType.kMilliseconds:
      return 'ms';
    case UnitType.kSeconds:
      return 's';
    // case UnitType.kHertz:
    //   return 'hz';
    // case UnitType.kKilohertz:
    //   return 'khz';
    case UnitType.kTurns:
      return 'turn';
    // case UnitType.kFraction:
    //   return 'fr';
    // case UnitType.kViewportWidth:
    //   return 'vw';
    // case UnitType.kViewportHeight:
    //   return 'vh';
    // case UnitType.kViewportInlineSize:
    //   return 'vi';
    // case UnitType.kViewportBlockSize:
    //   return 'vb';
    // case UnitType.kViewportMin:
    //   return 'vmin';
    // case UnitType.kViewportMax:
    //   return 'vmax';
    // case UnitType.kSmallViewportWidth:
    //   return 'svw';
    // case UnitType.kSmallViewportHeight:
    //   return 'svh';
    // case UnitType.kSmallViewportInlineSize:
    //   return 'svi';
    // case UnitType.kSmallViewportBlockSize:
    //   return 'svb';
    // case UnitType.kSmallViewportMin:
    //   return 'svmin';
    // case UnitType.kSmallViewportMax:
    //   return 'svmax';
    // case UnitType.kLargeViewportWidth:
    //   return 'lvw';
    // case UnitType.kLargeViewportHeight:
    //   return 'lvh';
    // case UnitType.kLargeViewportInlineSize:
    //   return 'lvi';
    // case UnitType.kLargeViewportBlockSize:
    //   return 'lvb';
    // case UnitType.kLargeViewportMin:
    //   return 'lvmin';
    // case UnitType.kLargeViewportMax:
    //   return 'lvmax';
    // case UnitType.kDynamicViewportWidth:
    //   return 'dvw';
    // case UnitType.kDynamicViewportHeight:
    //   return 'dvh';
    // case UnitType.kDynamicViewportInlineSize:
    //   return 'dvi';
    // case UnitType.kDynamicViewportBlockSize:
    //   return 'dvb';
    // case UnitType.kDynamicViewportMin:
    //   return 'dvmin';
    // case UnitType.kDynamicViewportMax:
    //   return 'dvmax';
    // case UnitType.kContainerWidth:
    //   return 'cqw';
    // case UnitType.kContainerHeight:
    //   return 'cqh';
    // case UnitType.kContainerInlineSize:
    //   return 'cqi';
    // case UnitType.kContainerBlockSize:
    //   return 'cqb';
    // case UnitType.kContainerMin:
    //   return 'cqmin';
    // case UnitType.kContainerMax:
    //   return 'cqmax';
    default:
      break;
  }
  return '';
};

/**
 * CSSStyleValue is the base class for all CSS values accessible from Typed OM.
 * Values that are not yet supported as specific types are also returned as base CSSStyleValues.
 *
 * Spec @see https://drafts.css-houdini.org/css-typed-om/#stylevalue-objects
 * Docs @see https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleValue
 */
export abstract class CSSStyleValue {
  // static parse(propertyName: string, value: string): CSSStyleValue {
  //   return parseCSSStyleValue(propertyName, value)[0];
  // }

  // static parseAll(propertyName: string, value: string): CSSStyleValue[] {
  //   return parseCSSStyleValue(propertyName, value);
  // }

  static isAngle(unit: UnitType) {
    return (
      unit === UnitType.kDegrees ||
      unit === UnitType.kRadians ||
      unit === UnitType.kGradians ||
      unit === UnitType.kTurns
    );
  }

  // static isViewportPercentageLength(type: UnitType) {
  //   return type >= UnitType.kViewportWidth && type <= UnitType.kDynamicViewportMax;
  // }

  // static isContainerPercentageLength(type: UnitType) {
  //   return type >= UnitType.kContainerWidth && type <= UnitType.kContainerMax;
  // }

  static isLength(type: UnitType) {
    // return (type >= UnitType.kEms && type <= UnitType.kUserUnits) || type == UnitType.kQuirkyEms;
    return type >= UnitType.kEms && type < UnitType.kDegrees;
  }

  static isRelativeUnit(type: UnitType) {
    return (
      type === UnitType.kPercentage ||
      type === UnitType.kEms ||
      // type === UnitType.kExs ||
      type === UnitType.kRems
      // type === UnitType.kChs ||
      // this.isViewportPercentageLength(type) ||
      // this.isContainerPercentageLength(type)
    );
  }

  static isTime(unit: UnitType) {
    return unit === UnitType.kSeconds || unit === UnitType.kMilliseconds;
  }

  // static isFrequency(unit: UnitType) {
  //   return unit == UnitType.kHertz || unit == UnitType.kKilohertz;
  // }

  // static isResolution(type: UnitType) {
  //   return type >= UnitType.kDotsPerPixel && type <= UnitType.kDotsPerCentimeter;
  // }

  // static isFlex(unit: UnitType) {
  //   return unit === UnitType.kFraction;
  // }

  protected abstract getType(): CSSStyleValueType;

  abstract buildCSSText(n: Nested, p: ParenLess, result: string): string;

  abstract clone(): CSSStyleValue;

  // protected abstract toCSSValue(): CSSValue;

  toString(): string {
    return this.buildCSSText(Nested.kNo, ParenLess.kNo, '');
  }

  isNumericValue() {
    return (
      this.getType() >= CSSStyleValueType.kUnitType &&
      this.getType() <= CSSStyleValueType.kClampType
    );
  }
}
