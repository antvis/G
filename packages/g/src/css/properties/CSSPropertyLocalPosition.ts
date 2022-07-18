import { singleton } from 'mana-syringe';
import type { Circle, DisplayObject, Line, Rect } from '../../display-objects';
import { Shape } from '../../types';
import { isNil } from '../../utils';
import type { CSSUnitValue } from '../cssom';
import { CSSProperty } from '../CSSProperty';
import { PropertySyntax } from '../interfaces';
import { CSSPropertyLengthOrPercentage } from './CSSPropertyLengthOrPercentage';

/**
 * local position
 */
@singleton({
  token: {
    token: CSSProperty,
    named: PropertySyntax.COORDINATE,
  },
})
export class CSSPropertyLocalPosition
  extends CSSPropertyLengthOrPercentage
  implements Partial<CSSProperty<CSSUnitValue, CSSUnitValue>>
{
  /**
   * update local position
   */
  postProcessor(object: DisplayObject) {
    let x: number;
    let y: number;
    let z: number;

    switch (object.nodeName) {
      case Shape.CIRCLE:
      case Shape.ELLIPSE:
        const { cx, cy } = (object as Circle).parsedStyle;
        if (!isNil(cx)) {
          x = cx.value;
        }
        if (!isNil(cy)) {
          y = cy.value;
        }
        break;
      case Shape.LINE:
        const { x1, x2, y1, y2 } = (object as Line).parsedStyle;
        const minX = Math.min(x1.value, x2.value);
        const minY = Math.min(y1.value, y2.value);
        x = minX;
        y = minY;
        z = 0;
        object.parsedStyle.defX = x || 0;
        object.parsedStyle.defY = y || 0;
        break;
      case Shape.RECT:
      case Shape.IMAGE:
      case Shape.GROUP:
      case Shape.HTML:
      case Shape.TEXT:
        if (!isNil((object as Rect).parsedStyle.x)) {
          x = (object as Rect).parsedStyle.x.value;
        }
        if (!isNil((object as Rect).parsedStyle.y)) {
          y = (object as Rect).parsedStyle.y.value;
        }
        break;
      default:
        break;
    }

    const needResetLocalPosition = !isNil(x) || !isNil(y) || !isNil(z);
    if (needResetLocalPosition) {
      const [ox, oy, oz] = object.getLocalPosition();
      object.setLocalPosition(isNil(x) ? ox : x, isNil(y) ? oy : y, isNil(z) ? oz : z);
    }
  }
}
