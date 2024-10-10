import type { CSSColorPercent, CSSColorRGBComp } from './CSSColorValue';
import { CSSColorValue } from './CSSColorValue';
import type { Nested, ParenLess } from './types';

/**
 * The CSSRGB class represents the CSS rgb()/rgba() functions.
 *
 * @see https://drafts.css-houdini.org/css-typed-om-1/#cssrgb
 */
export class CSSRGB extends CSSColorValue {
  constructor(
    public r: CSSColorRGBComp,
    public g: CSSColorRGBComp,
    public b: CSSColorRGBComp,
    public alpha: CSSColorPercent = 1,
    /**
     * 'transparent' & 'none' has the same rgba data
     */
    public isNone = false,
  ) {
    super('rgb');
  }

  clone() {
    return new CSSRGB(this.r, this.g, this.b, this.alpha);
  }

  buildCSSText(n: Nested, p: ParenLess, result: string): string {
    return `${result}rgba(${this.r},${this.g},${this.b},${this.alpha})`;
  }
}
