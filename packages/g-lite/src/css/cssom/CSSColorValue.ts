import { CSSStyleValue, CSSStyleValueType } from './CSSStyleValue';
import { CSSNumberish } from './CSSNumericValue';

/**
 * @see https://drafts.css-houdini.org/css-typed-om-1/#dom-csscolorvalue-colorspace
 */
export type ColorSpace = 'rgb' | 'hsl' | 'hwb' | 'lch' | 'lab';
export type CSSColorRGBComp = CSSNumberish | 'none';
export type CSSColorPercent = CSSNumberish | 'none';
export type CSSColorNumber = CSSNumberish | 'none';
export type CSSColorAngle = CSSNumberish | 'none';

/**
 * CSSColorValue is the base class used for the various CSS color interfaces.
 *
 * @see https://drafts.css-houdini.org/css-typed-om-1/#colorvalue-objects
 */
export abstract class CSSColorValue extends CSSStyleValue {
  constructor(public colorSpace: ColorSpace) {
    super();
  }

  getType() {
    return CSSStyleValueType.kColorType;
  }

  /**
   * @see https://drafts.css-houdini.org/css-typed-om-1/#dom-csscolorvalue-to
   */
  to(colorSpace: ColorSpace): CSSColorValue {
    return this;
  }
}
