import type { ParsedPolylineStyleProps } from '@antv/g';
import type { ElementRenderer } from '.';
import { singleton } from 'mana-syringe';

@singleton()
export class PolylineRenderer implements ElementRenderer<ParsedPolylineStyleProps> {
  dependencies = ['points'];
  apply($el: SVGElement, parsedStyle: ParsedPolylineStyleProps) {
    const { points, defX: x = 0, defY: y = 0 } = parsedStyle;

    if (points && points.points && points.points.length >= 2) {
      $el.setAttribute(
        'points',
        points.points.map((point: [number, number]) => `${point[0] - x},${point[1] - y}`).join(' '),
      );
    }
  }
}
