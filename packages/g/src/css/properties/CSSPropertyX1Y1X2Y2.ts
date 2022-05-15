import { singleton } from 'mana-syringe';
import type { DisplayObject, ParsedLineStyleProps } from '../../display-objects';
import type { CSSProperty } from '../CSSProperty';
import type { CSSUnitValue } from '../cssom';
import { CSSPropertyLengthOrPercentage } from './CSSPropertyLengthOrPercentage';

/**
 * <Line>'s x1/y1/x2/y2
 */
@singleton()
export class CSSPropertyX1Y1X2Y2
  extends CSSPropertyLengthOrPercentage
  implements Partial<CSSProperty<CSSUnitValue, CSSUnitValue>>
{
  /**
   * update local position
   */
  postProcessor(object: DisplayObject) {
    const { x1, x2, y1, y2, z1, z2 } = object.parsedStyle as ParsedLineStyleProps;
    const minX = Math.min(x1.value, x2.value);
    const minY = Math.min(y1.value, y2.value);
    const minZ = Math.min(z1?.value || 0, z2?.value || 0);

    object.parsedStyle.defX = minX;
    object.parsedStyle.defY = minY;

    object.setLocalPosition(minX, minY, minZ);
  }
}
