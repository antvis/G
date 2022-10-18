import { clampedMergeNumbers } from '../parser/numeric';
import { CSSPropertyLengthOrPercentage } from './CSSPropertyLengthOrPercentage';

export class CSSPropertyShadowBlur extends CSSPropertyLengthOrPercentage {
  mixer = clampedMergeNumbers(0, Infinity);
}
