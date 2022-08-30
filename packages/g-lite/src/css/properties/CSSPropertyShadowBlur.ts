import { singleton } from 'tsyringe';
import { clampedMergeNumbers } from '../parser/numeric';
import { CSSPropertyLengthOrPercentage } from './CSSPropertyLengthOrPercentage';

@singleton()
export class CSSPropertyShadowBlur extends CSSPropertyLengthOrPercentage {
  mixer = clampedMergeNumbers(0, Infinity);
}
