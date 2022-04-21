import { singleton } from 'mana-syringe';
import { GeometryAABBUpdater } from './interfaces';
import type { Ellipse, ParsedEllipseStyleProps } from '../../display-objects/Ellipse';
import { Shape } from '../../types';

@singleton({ token: { token: GeometryAABBUpdater, named: Shape.ELLIPSE } })
export class EllipseUpdater implements GeometryAABBUpdater<ParsedEllipseStyleProps> {
  update(parsedStyle: ParsedEllipseStyleProps, object: Ellipse) {
    const { rx, ry, x, y } = parsedStyle;

    const width = rx.value * 2;
    const height = ry.value * 2;

    return {
      width,
      height,
      x: x.value || 0,
      y: y.value || 0,
    };
  }
}
