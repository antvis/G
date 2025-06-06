import type { CanvasRenderer } from '@antv/g-canvas';
import type { DisplayObject, ParsedLineStyleProps } from '@antv/g-lite';
import {
  generateRoughOptions,
  isRoughRendering,
  RoughCanvasRendererOptions,
} from '../util';

export class LineRenderer implements CanvasRenderer.StyleRenderer {
  constructor(private options: RoughCanvasRendererOptions) {}

  render(
    context: CanvasRenderingContext2D,
    parsedStyle: ParsedLineStyleProps,
    object: DisplayObject<any, any>,
  ) {
    if (isRoughRendering(this.options.roughRendering, object)) {
      const { x1 = 0, y1 = 0, x2 = 0, y2 = 0 } = parsedStyle;
      // @see https://github.com/rough-stuff/rough/wiki#line-x1-y1-x2-y2--options
      // @ts-ignore
      context.roughCanvas.line(x1, y1, x2, y2, generateRoughOptions(object));
    } else {
      this.options.defaultStyleRendererFactory.render(
        context,
        parsedStyle,
        object,
      );
    }
  }
}
