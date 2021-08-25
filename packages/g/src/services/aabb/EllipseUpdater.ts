import { injectable } from 'inversify';
import type { GeometryAABBUpdater } from '.';
import type { EllipseStyleProps } from '../../display-objects/Ellipse';

@injectable()
export class EllipseUpdater implements GeometryAABBUpdater<EllipseStyleProps> {
  update(parsedStyle: EllipseStyleProps) {
    const { rx = 0, ry = 0, x = 0, y = 0 } = parsedStyle;
    return {
      width: rx * 2,
      height: ry * 2,
      x,
      y,
    };
  }
}
