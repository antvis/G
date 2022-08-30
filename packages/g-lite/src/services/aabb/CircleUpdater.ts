import { singleton } from 'tsyringe';
import type { Circle, ParsedCircleStyleProps } from '../../display-objects/Circle';
import { GeometryAABBUpdater } from './interfaces';

@singleton()
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
