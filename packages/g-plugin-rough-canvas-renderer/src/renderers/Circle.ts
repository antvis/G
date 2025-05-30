import type { CanvasRenderer } from '@antv/g-canvas';
import type { DisplayObject, ParsedCircleStyleProps } from '@antv/g-lite';
import {
  generateRoughOptions,
  isRoughRendering,
  RoughCanvasRendererOptions,
} from '../util';

export class CircleRenderer implements CanvasRenderer.StyleRenderer {
  constructor(private options: RoughCanvasRendererOptions) {}

  render(
    context: CanvasRenderingContext2D,
    parsedStyle: ParsedCircleStyleProps,
    object: DisplayObject<any, any>,
  ) {
    if (isRoughRendering(this.options.roughRendering, object)) {
      const { cx = 0, cy = 0, r } = parsedStyle;
      // rough.js use diameter instead of radius
      // @see https://github.com/rough-stuff/rough/wiki#circle-x-y-diameter--options
      // @ts-ignore
      context.roughCanvas.circle(cx, cy, r * 2, generateRoughOptions(object));
    } else {
      this.options.defaultStyleRendererFactory.render(
        context,
        parsedStyle,
        object,
      );
    }
  }
}
