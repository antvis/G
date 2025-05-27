import type { CanvasRenderer } from '@antv/g-canvas';
import type { DisplayObject, ParsedRectStyleProps } from '@antv/g-lite';
import { generateRoughOptions } from '../util';

export class RectRenderer implements CanvasRenderer.StyleRenderer {
  constructor(private defaultStyleRendererFactory) {}

  render(
    context: CanvasRenderingContext2D,
    parsedStyle: ParsedRectStyleProps,
    object: DisplayObject<any, any>,
  ) {
    const { x = 0, y = 0, width, height } = parsedStyle;
    if (!object?.attributes?.class?.includes('no-rough')) {
      // @see https://github.com/rough-stuff/rough/wiki#rectangle-x-y-width-height--options
      // @ts-ignore
      context.roughCanvas.rectangle(
        x,
        y,
        width,
        height,
        generateRoughOptions(object),
      );
    } else {
      this.defaultStyleRendererFactory.render(context, parsedStyle, object);
    }
  }
}
