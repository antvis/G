import type { CanvasRenderer } from '@antv/g-canvas';
import type { DisplayObject, ParsedPolylineStyleProps } from '@antv/g-lite';
import {
  generateRoughOptions,
  isRoughRendering,
  RoughCanvasRendererOptions,
} from '../util';

export class PolylineRenderer implements CanvasRenderer.StyleRenderer {
  constructor(private options: RoughCanvasRendererOptions) {}

  render(
    context: CanvasRenderingContext2D,
    parsedStyle: ParsedPolylineStyleProps,
    object: DisplayObject<any, any>,
  ) {
    if (isRoughRendering(this.options.roughRendering, object)) {
      const { points } = parsedStyle;
      // @see https://github.com/rough-stuff/rough/wiki#linearpath-points--options
      // @ts-ignore
      context.roughCanvas.linearPath(
        points.points.map(([x, y]) => [x, y]),
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
