import { CSSStyleValue, CSSStyleValueType } from './CSSStyleValue';
import type { Nested, ParenLess } from './types';

export interface LinearGradient {
  angle: number;
  steps: [number, string][];
  hash: string;
}

export interface RadialGradient {
  cx: number;
  cy: number;
  steps: [number, string][];
  hash: string;
}

export enum GradientType {
  Constant,
  LinearGradient,
  RadialGradient,
}

export class CSSGradientValue extends CSSStyleValue {
  constructor(public type: GradientType, public value: LinearGradient | RadialGradient) {
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
