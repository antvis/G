import { isNil } from '@antv/util';
import type { DisplayObject, Rect, Text } from '../../display-objects';
import { ParsedBaseStyleProps, Shape } from '../../types';
import { parsedTransformToMat4 } from '../../utils/transform-mat4';
import type { CSSProperty } from '../CSSProperty';
import type { CSSUnitValue } from '../cssom';
import { CSSPropertyLengthOrPercentage } from './CSSPropertyLengthOrPercentage';

/**
 * local position
 */
export class CSSPropertyLocalPosition
  extends CSSPropertyLengthOrPercentage
  implements Partial<CSSProperty<CSSUnitValue, number>>
{
  /**
   * update local position
   */
  postProcessor(object: DisplayObject, attributes: string[]) {
    let x: number;
    let y: number;
    let z: number;

    switch (object.nodeName) {
      case Shape.GROUP:
        if (!isNil((object as Rect).parsedStyle.x)) {
          x = (object as Rect).parsedStyle.x;
        }
        if (!isNil((object as Rect).parsedStyle.y)) {
          y = (object as Rect).parsedStyle.y;
        }
        if (!isNil((object as Text).parsedStyle.z)) {
          z = (object as Text).parsedStyle.z;
        }
        break;
      default:
        break;
    }

    const needResetLocalPosition = !isNil(x) || !isNil(y) || !isNil(z);
    // only if `transform` won't be processed later
    if (needResetLocalPosition && attributes.indexOf('transform') === -1) {
      // account for current transform if needed
      const { transform } = object.parsedStyle as ParsedBaseStyleProps;
      if (transform && transform.length) {
        parsedTransformToMat4(transform, object);
      } else {
        const [ox, oy, oz] = object.getLocalPosition();
        object.setLocalPosition(
          isNil(x) ? ox : x,
          isNil(y) ? oy : y,
          isNil(z) ? oz : z,
        );
      }
    }
  }
}
