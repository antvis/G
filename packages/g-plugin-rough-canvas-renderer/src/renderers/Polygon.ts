import type { DisplayObject, ParsedPolygonStyleProps } from '@antv/g';
import { singleton } from '@antv/g';
import { CanvasRenderer } from '@antv/g-canvas';
import { generateRoughOptions } from '../util';

@singleton({
  token: CanvasRenderer.PolygonRendererContribution,
})
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
