import type { CanvasRenderer } from '@antv/g-canvas';
import type { DisplayObject, ParsedLineStyleProps } from '@antv/g-lite';
import { generateRoughOptions } from '../util';

export class LineRenderer implements CanvasRenderer.StyleRenderer {
  render(
    context: CanvasRenderingContext2D,
    parsedStyle: ParsedLineStyleProps,
    object: DisplayObject<any, any>,
  ) {
    const { x1, y1, x2, y2 } = parsedStyle as ParsedLineStyleProps;
    // @see https://github.com/rough-stuff/rough/wiki#line-x1-y1-x2-y2--options
    // @ts-ignore
    context.roughCanvas.line(x1, y1, x2, y2, generateRoughOptions(object));
  }
}
