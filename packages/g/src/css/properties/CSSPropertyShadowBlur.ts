import { singleton } from 'mana-syringe';
import { clampedMergeNumbers } from '../..';
import { CSSPropertyLengthOrPercentage } from './CSSPropertyLengthOrPercentage';

@singleton()
export class CSSPropertyShadowBlur extends CSSPropertyLengthOrPercentage {
  mixer = clampedMergeNumbers(0, Infinity);
}
