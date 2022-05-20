import { clampedMergeNumbers } from '../parser';
import { CSSPropertyLengthOrPercentage } from './CSSPropertyLengthOrPercentage';

export const CSSPropertyShadowBlur: typeof CSSPropertyLengthOrPercentage = {
  parser: CSSPropertyLengthOrPercentage.parser,
  mixer: clampedMergeNumbers(0, Infinity),
  calculator: CSSPropertyLengthOrPercentage.calculator,
};
