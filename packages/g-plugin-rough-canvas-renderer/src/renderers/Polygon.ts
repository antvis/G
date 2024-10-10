import type { CanvasRenderer } from '@antv/g-canvas';
import type { DisplayObject, ParsedPolygonStyleProps } from '@antv/g-lite';
import { generateRoughOptions } from '../util';

export class PolygonRenderer implements CanvasRenderer.StyleRenderer {
  render(
    context: CanvasRenderingContext2D,
    parsedStyle: ParsedPolygonStyleProps,
    object: DisplayObject<any, any>,
  ) {
    const { points } = parsedStyle;
    // @see https://github.com/rough-stuff/rough/wiki#polygon-vertices--options
    // @ts-ignore
    context.roughCanvas.polygon(
      points.points.map(([x, y]) => [x, y]),
      generateRoughOptions(object),
    );
  }
}
