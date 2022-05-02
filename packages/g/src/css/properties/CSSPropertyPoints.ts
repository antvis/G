import { singleton } from 'mana-syringe';
import type { DisplayObject } from '../../display-objects';
import type { ParsedBaseStyleProps } from '../../types';
import type { CSSProperty } from '../CSSProperty';
import { parsePoints } from '../parser';

@singleton()
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
    const { x, y, z } = object.parsedStyle as ParsedBaseStyleProps;
    object.setLocalPosition((x && x.value) || 0, (y && y.value) || 0, (z && z.value) || 0);
  }
}
