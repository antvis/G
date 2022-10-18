import type { Circle, ParsedCircleStyleProps } from '../../display-objects/Circle';
import type { GeometryAABBUpdater } from './interfaces';
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
