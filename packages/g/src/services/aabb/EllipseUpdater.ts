import { singleton } from 'mana-syringe';
import { GeometryAABBUpdater } from './interfaces';
import type { Ellipse, ParsedEllipseStyleProps } from '../../display-objects/Ellipse';
import { Shape } from '../../types';

@singleton({ token: { token: GeometryAABBUpdater, named: Shape.ELLIPSE } })
export class EllipseUpdater implements GeometryAABBUpdater<ParsedEllipseStyleProps> {
  update(parsedStyle: ParsedEllipseStyleProps, object: Ellipse) {
    const { rx, ry, x = 0, y = 0 } = parsedStyle;

    const { unit: rxUnit, value: rxValue } = rx;
    const { unit: ryUnit, value: ryValue } = ry;

    let width = 0;
    let height = 0;
    if (rxUnit === '' || rxUnit === 'px') {
      width = rxValue * 2;
    }
    if (ryUnit === '' || ryUnit === 'px') {
      height = ryValue * 2;
    }

    object.parsedStyle.rxInPixels = width / 2;
    object.parsedStyle.ryInPixels = height / 2;

    return {
      width,
      height,
      x,
      y,
    };
  }
}
