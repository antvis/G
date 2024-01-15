import type {
  Ellipse,
  ParsedEllipseStyleProps,
} from '../../display-objects/Ellipse';
import type { GeometryAABBUpdater } from './interfaces';

export class EllipseUpdater
  implements GeometryAABBUpdater<ParsedEllipseStyleProps>
{
  update(parsedStyle: ParsedEllipseStyleProps, object: Ellipse) {
    const { cx, cy, rx, ry } = parsedStyle;

    return {
      cx,
      cy,
      hwidth: rx,
      hheight: ry,
    };
  }
}
