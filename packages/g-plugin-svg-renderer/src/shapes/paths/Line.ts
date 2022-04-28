import type { ParsedLineStyleProps } from '@antv/g';
import { CSSRGB } from '@antv/g';
import type { ElementRenderer } from '.';
import { singleton } from 'mana-syringe';

@singleton()
export class LineRenderer implements ElementRenderer<ParsedLineStyleProps> {
  dependencies = ['x1', 'y1', 'x2', 'y2'];
  apply($el: SVGElement, parsedStyle: ParsedLineStyleProps) {
    const { x1, y1, x2, y2, defX: x = 0, defY: y = 0, stroke } = parsedStyle;

    $el.setAttribute('x1', `${x1.value - x}`);
    $el.setAttribute('y1', `${y1.value - y}`);
    $el.setAttribute('x2', `${x2.value - x}`);

    // fix horizontal line stroke url bug in Chrome
    // @see https://stackoverflow.com/questions/14680240/did-chrome-break-svg-stroke-url
    if (y1.value === y2.value && stroke && !(stroke instanceof CSSRGB)) {
      $el.setAttribute('y2', `${y2.value - y + 0.00001}`);
    } else {
      $el.setAttribute('y2', `${y2.value - y}`);
    }
  }
}
