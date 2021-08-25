import { injectable } from 'inversify';
import type { GeometryAABBUpdater } from '.';
import type { CircleStyleProps } from '../../display-objects/Circle';

@injectable()
export class CircleUpdater implements GeometryAABBUpdater<CircleStyleProps> {
  update(parsedStyle: CircleStyleProps) {
    const { r = 0, x = 0, y = 0 } = parsedStyle;
    return {
      width: r * 2,
      height: r * 2,
      x,
      y,
    };
  }
}
