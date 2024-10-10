import type {
  Circle,
  ParsedCircleStyleProps,
} from '../../display-objects/Circle';
import type { GeometryAABBUpdater } from './interfaces';

export class CircleUpdater
  implements GeometryAABBUpdater<ParsedCircleStyleProps>
{
  update(parsedStyle: ParsedCircleStyleProps, object: Circle) {
    const { cx = 0, cy = 0, r = 0 } = parsedStyle;

    return {
      cx,
      cy,
      hwidth: r,
      hheight: r,
    };
  }
}
