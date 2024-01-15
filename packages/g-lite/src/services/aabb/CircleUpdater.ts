import type {
  Circle,
  ParsedCircleStyleProps,
} from '../../display-objects/Circle';
import type { GeometryAABBUpdater } from './interfaces';
export class CircleUpdater
  implements GeometryAABBUpdater<ParsedCircleStyleProps>
{
  update(parsedStyle: ParsedCircleStyleProps, object: Circle) {
    const { cx, cy, r } = parsedStyle;

    return {
      cx,
      cy,
      hwidth: r,
      hheight: r,
    };
  }
}
