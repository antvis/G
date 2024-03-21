import type {
  Ellipse,
  ParsedEllipseStyleProps,
} from '../../display-objects/Ellipse';
import type { GeometryAABBUpdater } from './interfaces';

export class EllipseUpdater
  implements GeometryAABBUpdater<ParsedEllipseStyleProps>
{
  update(parsedStyle: ParsedEllipseStyleProps, object: Ellipse) {
    const { cx = 0, cy = 0, rx = 0, ry = 0 } = parsedStyle;

    return {
      cx,
      cy,
      hwidth: rx,
      hheight: ry,
    };
  }
}
