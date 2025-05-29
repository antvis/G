import type { CanvasRenderer } from '@antv/g-canvas';
import type { DisplayObject, ParsedPolygonStyleProps } from '@antv/g-lite';
import {
  generateRoughOptions,
  isRoughRendering,
  RoughCanvasRendererOptions,
} from '../util';

export class PolygonRenderer implements CanvasRenderer.StyleRenderer {
  constructor(private options: RoughCanvasRendererOptions) {}

  render(
    context: CanvasRenderingContext2D,
    parsedStyle: ParsedPolygonStyleProps,
    object: DisplayObject<any, any>,
  ) {
    if (isRoughRendering(this.options.roughRendering, object)) {
      const { points } = parsedStyle;
      // @see https://github.com/rough-stuff/rough/wiki#polygon-vertices--options
      // @ts-ignore
      context.roughCanvas.polygon(
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
