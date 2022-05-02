import { singleton } from 'mana-syringe';
import type { ParsedBaseStyleProps } from '../../types';
import type { DisplayObject } from '../../display-objects';
import type { CSSProperty } from '../CSSProperty';
import type { CSSUnitValue } from '../cssom';
import { mergeDimensions, parseLengthOrPercentage } from '../parser';
import { CSSPropertyLengthOrPercentage } from './CSSPropertyLengthOrPercentage';

/**
 * local position
 */
@singleton()
export class CSSPropertyLocalPosition
  extends CSSPropertyLengthOrPercentage
  implements Partial<CSSProperty<CSSUnitValue, CSSUnitValue>>
{
  /**
   * <length> & <percentage>
   */
  parser = parseLengthOrPercentage;

  /**
   * mix between CSS.px(x)
   */
  mixer = mergeDimensions;

  /**
   * update local position
   */
  postProcessor(object: DisplayObject) {
    const { x, y, z } = object.parsedStyle as ParsedBaseStyleProps;
    object.setLocalPosition((x && x.value) || 0, (y && y.value) || 0, (z && z.value) || 0);
  }
}
