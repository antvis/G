import type { CanvasRenderer } from '@antv/g-canvas';
import type { DisplayObject, ParsedEllipseStyleProps } from '@antv/g-lite';
import { generateRoughOptions } from '../util';

export class EllipseRenderer implements CanvasRenderer.StyleRenderer {
  render(
    context: CanvasRenderingContext2D,
    parsedStyle: ParsedEllipseStyleProps,
    object: DisplayObject<any, any>,
  ) {
    const { cx, cy, rx, ry } = parsedStyle as ParsedEllipseStyleProps;
    // @ts-ignore
    context.roughCanvas.ellipse(
      cx - rx,
      cy - ry,
      rx * 2,
      ry * 2,
      generateRoughOptions(object),
    );
  }
}
