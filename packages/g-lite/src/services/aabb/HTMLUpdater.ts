import type { HTML, ParsedHTMLStyleProps } from '../../display-objects/HTML';
import type { GeometryAABBUpdater } from './interfaces';

export class HTMLUpdater implements GeometryAABBUpdater<ParsedHTMLStyleProps> {
  update(parsedStyle: ParsedHTMLStyleProps, object: HTML) {
    const { x = 0, y = 0, width = 0, height = 0 } = parsedStyle;

    return {
      cx: x + width / 2,
      cy: y + height / 2,
      hwidth: width / 2,
      hheight: height / 2,
    };
  }
}
