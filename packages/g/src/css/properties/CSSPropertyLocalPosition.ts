import { singleton } from 'mana-syringe';
import type { ParsedBaseStyleProps } from '../../types';
import type { DisplayObject } from '../../display-objects';
import type { CSSProperty } from '../CSSProperty';
import type { CSSUnitValue } from '../cssom';
import { CSSPropertyLengthOrPercentage } from './CSSPropertyLengthOrPercentage';
import { isNil } from '../../utils';

/**
 * local position
 */
@singleton()
export class CSSPropertyLocalPosition
  extends CSSPropertyLengthOrPercentage
  implements Partial<CSSProperty<CSSUnitValue, CSSUnitValue>>
{
  /**
   * update local position
   */
  postProcessor(object: DisplayObject) {
    const { x, y, z } = object.parsedStyle as ParsedBaseStyleProps;
    const [ox, oy, oz] = object.getLocalPosition();
    object.setLocalPosition(
      isNil(x) ? ox : x.value,
      isNil(y) ? oy : y.value,
      isNil(z) ? oz : z.value,
    );
  }
}
