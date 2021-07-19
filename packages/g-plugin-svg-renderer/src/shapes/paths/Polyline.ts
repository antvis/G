import { PolylineStyleProps } from '@antv/g';
import { ElementRenderer } from '.';
import { injectable } from 'inversify';

@injectable()
export class PolylineRenderer implements ElementRenderer<PolylineStyleProps> {
  apply($el: SVGElement, attributes: PolylineStyleProps) {
    // @ts-ignore
    const { points, x = 0, y = 0 } = attributes;

    if (points && points.length >= 2) {
      $el.setAttribute(
        'points',
        (points as [number, number][]).map((point: [number, number]) => `${point[0] - x},${point[1] - y}`).join(' ')
      );
    }
  }
}
