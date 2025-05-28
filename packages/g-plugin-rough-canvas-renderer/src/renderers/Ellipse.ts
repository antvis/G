import type { CanvasRenderer } from '@antv/g-canvas';
import type { DisplayObject, ParsedEllipseStyleProps } from '@antv/g-lite';
import {
  generateRoughOptions,
  isRoughRendering,
  RoughCanvasRendererOptions,
} from '../util';

export class EllipseRenderer implements CanvasRenderer.StyleRenderer {
  constructor(private options: RoughCanvasRendererOptions) {}

  render(
    context: CanvasRenderingContext2D,
    parsedStyle: ParsedEllipseStyleProps,
    object: DisplayObject<any, any>,
  ) {
    if (isRoughRendering(this.options.roughRendering, object)) {
      const { cx = 0, cy = 0, rx, ry } = parsedStyle;
      // @ts-ignore
      context.roughCanvas.ellipse(
        cx,
        cy,
        rx * 2,
        ry * 2,
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
