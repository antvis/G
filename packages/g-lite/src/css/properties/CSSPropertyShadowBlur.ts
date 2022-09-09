import { singleton } from 'mana-syringe';
import { CSSProperty } from '../CSSProperty';
import { PropertySyntax } from '../interfaces';
import { clampedMergeNumbers } from '../parser/numeric';
import { CSSPropertyLengthOrPercentage } from './CSSPropertyLengthOrPercentage';

@singleton({
  token: {
    token: CSSProperty,
    named: PropertySyntax.SHADOW_BLUR,
  },
})
export class CSSPropertyShadowBlur extends CSSPropertyLengthOrPercentage {
  mixer = clampedMergeNumbers(0, Infinity);
}
