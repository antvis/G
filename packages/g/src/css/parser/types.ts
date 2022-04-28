import type { CSSStyleValue } from '../cssom';

export type CSSValueParser = (css: string) => CSSStyleValue;
