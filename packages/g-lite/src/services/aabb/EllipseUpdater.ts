import { singleton } from 'tsyringe';
import type { Ellipse, ParsedEllipseStyleProps } from '../../display-objects/Ellipse';
import { GeometryAABBUpdater } from './interfaces';

@singleton()
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
