import { singleton } from 'mana-syringe';
import type { Circle, ParsedCircleStyleProps } from '../../display-objects/Circle';
import { Shape } from '../../types';
import { GeometryAABBUpdater } from './interfaces';

@singleton({ token: { token: GeometryAABBUpdater, named: Shape.CIRCLE } })
export class CircleUpdater implements GeometryAABBUpdater<ParsedCircleStyleProps> {
  update(parsedStyle: ParsedCircleStyleProps, object: Circle) {
    const { r } = parsedStyle;

    const width = r * 2;
    const height = r * 2;

    return {
      width,
      height,
    };
  }
}
