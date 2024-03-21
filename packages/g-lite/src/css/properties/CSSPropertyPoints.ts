import type { CSSProperty } from '../CSSProperty';
import { parsePoints, mergePoints } from '../parser/points';

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

  mixer = mergePoints;
}
