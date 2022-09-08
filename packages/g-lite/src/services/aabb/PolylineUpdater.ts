import { singleton } from 'mana-syringe';
import type { ParsedPolylineStyleProps } from '../../display-objects';
import { Shape } from '../../types';
import { GeometryAABBUpdater } from './interfaces';

@singleton({
  token: [
    { token: GeometryAABBUpdater, named: Shape.POLYLINE },
    { token: GeometryAABBUpdater, named: Shape.POLYGON },
  ],
})
export class PolylineUpdater implements GeometryAABBUpdater<ParsedPolylineStyleProps> {
  update(parsedStyle: ParsedPolylineStyleProps) {
    const { points } = parsedStyle.points;

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
    };
  }
}
