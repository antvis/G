import { injectable } from 'inversify';
import type { GeometryAABBUpdater } from './interfaces';
import type { ParsedBaseStyleProps } from '../../types';

@injectable()
export class PolylineUpdater implements GeometryAABBUpdater<ParsedBaseStyleProps> {
  update(parsedStyle: ParsedBaseStyleProps) {
    const { points } = parsedStyle.points!;

    // FIXME: account for miter lineJoin
    const minX = Math.min(...points.map((point) => point[0]));
    const maxX = Math.max(...points.map((point) => point[0]));
    const minY = Math.min(...points.map((point) => point[1]));
    const maxY = Math.max(...points.map((point) => point[1]));

    const width = maxX - minX;
    const height = maxY - minY;

    return {
      width,
      height,
      x: minX,
      y: minY,
    };
  }
}
