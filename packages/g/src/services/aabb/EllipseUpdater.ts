import { singleton } from 'mana-syringe';
import { GeometryAABBUpdater } from './interfaces';
import type { ParsedEllipseStyleProps } from '../../display-objects/Ellipse';
import { SHAPE } from '../../types';

@singleton({ token: { token: GeometryAABBUpdater, named: SHAPE.Ellipse } })
export class EllipseUpdater implements GeometryAABBUpdater<ParsedEllipseStyleProps> {
  update(parsedStyle: ParsedEllipseStyleProps) {
    const { rx = 0, ry = 0, x = 0, y = 0 } = parsedStyle;
    return {
      width: rx * 2,
      height: ry * 2,
      x,
      y,
    };
  }
}
