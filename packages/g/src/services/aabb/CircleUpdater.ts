import { singleton } from 'mana-syringe';
import { GeometryAABBUpdater } from './interfaces';
import type { Circle, ParsedCircleStyleProps } from '../../display-objects/Circle';
import { Shape } from '../../types';

@singleton({ token: { token: GeometryAABBUpdater, named: Shape.CIRCLE } })
export class CircleUpdater implements GeometryAABBUpdater<ParsedCircleStyleProps> {
  update(parsedStyle: ParsedCircleStyleProps, object: Circle) {
    const { r, x = 0, y = 0 } = parsedStyle;
    const { unit, value } = r;

    let width = 0;
    let height = 0;
    // absolute unit
    if (unit === '' || unit === 'px') {
      width = value * 2;
      height = value * 2;
    }

    object.parsedStyle.rInPixels = width / 2;

    return {
      width,
      height,
      x,
      y,
    };
  }
}
