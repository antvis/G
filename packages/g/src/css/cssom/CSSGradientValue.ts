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

export interface Pattern {
  repetition: string;
  src: string;
  hash: string;
}

export enum GradientPatternType {
  Constant,
  LinearGradient,
  RadialGradient,
  Pattern,
}

export class CSSGradientValue extends CSSStyleValue {
  constructor(
    public type: GradientPatternType,
    public value: LinearGradient | RadialGradient | Pattern,
  ) {
    super();
  }

  clone() {
    return new CSSGradientValue(this.type, this.value);
  }

  buildCSSText(n: Nested, p: ParenLess, result: string): string {
    let text = '';
    if (this.type === GradientPatternType.LinearGradient) {
      text = `linear-gradient(${(this.value as LinearGradient).steps
        .map((step) => step.join(','))
        .join(',')})`;
    } else if (this.type === GradientPatternType.RadialGradient) {
      text = `radial-gradient(${(this.value as RadialGradient).steps
        .map((step) => step.join(','))
        .join(',')})`;
    } else if (this.type === GradientPatternType.Pattern) {
      text = `url(${(this.value as Pattern).src})`;
    }
    return (result += text);
  }

  getType() {
    return CSSStyleValueType.kColorType;
  }
}
