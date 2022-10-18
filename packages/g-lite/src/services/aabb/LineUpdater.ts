import type { ParsedLineStyleProps } from '../../display-objects/Line';
import type { GeometryAABBUpdater } from './interfaces';

export class LineUpdater implements GeometryAABBUpdater<ParsedLineStyleProps> {
  update(parsedStyle: ParsedLineStyleProps) {
    const { x1, y1, x2, y2 } = parsedStyle;

    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);

    const width = maxX - minX;
    const height = maxY - minY;

    return {
      width,
      height,
    };
  }
}
