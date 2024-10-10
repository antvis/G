import type { CSSKeywordValue } from './CSSKeywordValue';
import type { CSSUnitValue } from './CSSNumericValue';
import { CSSStyleValue, CSSStyleValueType } from './CSSStyleValue';
import type { Nested, ParenLess } from './types';

export interface LinearColorStop {
  offset: CSSUnitValue;
  color: string; // use user-defined value instead of parsed CSSRGB
}

export interface LinearGradient {
  angle: CSSUnitValue;
  steps: LinearColorStop[];
}

export interface RadialGradient {
  cx: CSSUnitValue;
  cy: CSSUnitValue;
  size?: CSSUnitValue | CSSKeywordValue;
  steps: LinearColorStop[];
}

export enum GradientType {
  Constant,
  LinearGradient,
  RadialGradient,
}

export class CSSGradientValue extends CSSStyleValue {
  constructor(
    public type: GradientType,
    public value: LinearGradient | RadialGradient,
  ) {
    super();
  }

  clone() {
    return new CSSGradientValue(this.type, this.value);
  }

  buildCSSText(n: Nested, p: ParenLess, result: string): string {
    return result;
  }

  getType() {
    return CSSStyleValueType.kColorType;
  }
}
