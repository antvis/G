import { ShapeAttrs } from '@antv/g';
import { ElementRenderer } from '.';
import { injectable } from 'inversify';

@injectable()
export class LineRenderer implements ElementRenderer {
  apply($el: SVGElement, attributes: ShapeAttrs) {
    const { x1, y1, x2, y2, x, y } = attributes;

    $el.setAttribute('x1', `${x1 - x}`);
    $el.setAttribute('y1', `${y1 - y}`);
    $el.setAttribute('x2', `${x2 - x}`);
    $el.setAttribute('y2', `${y2 - y}`);
  }
}
