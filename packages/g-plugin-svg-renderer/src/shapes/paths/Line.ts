import { PARSED_COLOR_TYPE, ParsedLineStyleProps } from '@antv/g';
import { ElementRenderer } from '.';
import { injectable } from 'inversify';

@injectable()
export class LineRenderer implements ElementRenderer<ParsedLineStyleProps> {
  dependencies = ['x1', 'y1', 'x2', 'y2'];
  apply($el: SVGElement, parsedStyle: ParsedLineStyleProps) {
    const { x1, y1, x2, y2, defX: x = 0, defY: y = 0, stroke } = parsedStyle;

    $el.setAttribute('x1', `${x1 - x}`);
    $el.setAttribute('y1', `${y1 - y}`);
    $el.setAttribute('x2', `${x2 - x}`);

    // fix horizontal line stroke url bug in Chrome
    // @see https://stackoverflow.com/questions/14680240/did-chrome-break-svg-stroke-url
    if (y1 === y2 && stroke && stroke.type !== PARSED_COLOR_TYPE.Constant) {
      $el.setAttribute('y2', `${y2 - y + 0.00001}`);
    } else {
      $el.setAttribute('y2', `${y2 - y}`);
    }
  }
}
