import { ParsedBaseStyleProps } from '@antv/g';
import { ElementRenderer } from '.';
import { injectable } from 'inversify';

@injectable()
export class PolylineRenderer implements ElementRenderer<ParsedBaseStyleProps> {
  dependencies = ['points'];
  apply($el: SVGElement, parsedStyle: ParsedBaseStyleProps) {
    const { points, x = 0, y = 0 } = parsedStyle;

    if (points.points && points.points.length >= 2) {
      $el.setAttribute(
        'points',
        points.points.map((point: [number, number]) => `${point[0] - x},${point[1] - y}`).join(' '),
      );
    }
  }
}
