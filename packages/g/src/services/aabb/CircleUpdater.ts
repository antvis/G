import { singleton } from 'mana-syringe';
import { GeometryAABBUpdater } from './interfaces';
import type { Circle, ParsedCircleStyleProps } from '../../display-objects/Circle';
import { Shape } from '../../types';

@singleton({ token: { token: GeometryAABBUpdater, named: Shape.CIRCLE } })
export class CircleUpdater implements GeometryAABBUpdater<ParsedCircleStyleProps> {
  update(parsedStyle: ParsedCircleStyleProps, object: Circle) {
    const { r, x, y } = parsedStyle;

    const width = r.value * 2;
    const height = r.value * 2;

    return {
      width,
      height,
      x: x.value || 0,
      y: y.value || 0,
    };
  }
}
