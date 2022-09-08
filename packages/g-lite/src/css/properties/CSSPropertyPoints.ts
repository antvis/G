import { singleton } from 'mana-syringe';
import type { DisplayObject } from '../../display-objects';
import type { ParsedBaseStyleProps } from '../../types';
import { Shape } from '../../types';
import { CSSProperty } from '../CSSProperty';
import { PropertySyntax } from '../interfaces';
import { parsePoints } from '../parser/points';

@singleton({
  token: {
    token: CSSProperty,
    named: PropertySyntax.LIST_OF_POINTS,
  },
})
export class CSSPropertyPoints
  implements
    Partial<
      CSSProperty<
        {
          points: [number, number][];
          totalLength: number;
          segments: [number, number][];
        },
        {
          points: [number, number][];
          totalLength: number;
          segments: [number, number][];
        }
      >
    >
{
  parser = parsePoints;

  /**
   * update local position
   */
  postProcessor(object: DisplayObject) {
    if (object.nodeName === Shape.POLYGON || object.nodeName === Shape.POLYLINE) {
      const { defX, defY } = object.parsedStyle as ParsedBaseStyleProps;
      object.setLocalPosition(defX, defY);
    }
  }
}
