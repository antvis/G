import type { CanvasRenderer } from '@antv/g-canvas';
import type { DisplayObject, ParsedRectStyleProps } from '@antv/g-lite';
import {
  generateRoughOptions,
  isRoughRendering,
  RoughCanvasRendererOptions,
} from '../util';

export class RectRenderer implements CanvasRenderer.StyleRenderer {
  constructor(private options: RoughCanvasRendererOptions) {}

  render(
    context: CanvasRenderingContext2D,
    parsedStyle: ParsedRectStyleProps,
    object: DisplayObject<any, any>,
  ) {
    if (isRoughRendering(this.options.roughRendering, object)) {
      const { x = 0, y = 0, width, height } = parsedStyle;
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
      this.options.defaultStyleRendererFactory.render(
        context,
        parsedStyle,
        object,
      );
    }
  }
}
