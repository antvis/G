import { CanvasRenderer } from '@antv/g-canvas';
import type { DisplayObject, ParsedPolygonStyleProps } from '@antv/g-lite';
import { singleton } from '@antv/g-lite';
import { generateRoughOptions } from '../util';

@singleton()
export class PolygonRenderer implements CanvasRenderer.StyleRenderer {
  render(
    context: CanvasRenderingContext2D,
    parsedStyle: ParsedPolygonStyleProps,
    object: DisplayObject<any, any>,
  ) {
    const { points, defX = 0, defY = 0 } = parsedStyle as ParsedPolygonStyleProps;
    // @see https://github.com/rough-stuff/rough/wiki#polygon-vertices--options
    // @ts-ignore
    context.roughCanvas.polygon(
      points.points.map(([x, y]) => [x - defX, y - defY]),
      generateRoughOptions(object),
    );
  }
}
