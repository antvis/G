import { singleton } from 'mana-syringe';
import { GeometryAABBUpdater } from './interfaces';
import type { ParsedCircleStyleProps } from '../../display-objects/Circle';
import { SHAPE } from '../../types';

@singleton({ token: { token: GeometryAABBUpdater, named: SHAPE.Circle } })
export class CircleUpdater implements GeometryAABBUpdater<ParsedCircleStyleProps> {
  update(parsedStyle: ParsedCircleStyleProps) {
    const { r = 0, x = 0, y = 0 } = parsedStyle;
    return {
      width: r * 2,
      height: r * 2,
      x,
      y,
    };
  }
}
