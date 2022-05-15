import { singleton } from 'mana-syringe';
import { GeometryAABBUpdater } from './interfaces';
import type { ParsedLineStyleProps } from '../../display-objects/Line';
import { Shape } from '../../types';

@singleton({ token: { token: GeometryAABBUpdater, named: Shape.LINE } })
export class LineUpdater implements GeometryAABBUpdater<ParsedLineStyleProps> {
  update(parsedStyle: ParsedLineStyleProps) {
    const { x1, y1, x2, y2 } = parsedStyle;

    const minX = Math.min(x1.value, x2.value);
    const maxX = Math.max(x1.value, x2.value);
    const minY = Math.min(y1.value, y2.value);
    const maxY = Math.max(y1.value, y2.value);

    const width = maxX - minX;
    const height = maxY - minY;

    return {
      width,
      height,
    };
  }
}
