import { singleton } from '@alipay/mana-syringe';
import type { Ellipse, ParsedEllipseStyleProps } from '../../display-objects/Ellipse';
import { Shape } from '../../types';
import { GeometryAABBUpdater } from './interfaces';

@singleton({ token: { token: GeometryAABBUpdater, named: Shape.ELLIPSE } })
export class EllipseUpdater implements GeometryAABBUpdater<ParsedEllipseStyleProps> {
  update(parsedStyle: ParsedEllipseStyleProps, object: Ellipse) {
    const { rx, ry } = parsedStyle;

    const width = rx * 2;
    const height = ry * 2;

    return {
      width,
      height,
    };
  }
}
