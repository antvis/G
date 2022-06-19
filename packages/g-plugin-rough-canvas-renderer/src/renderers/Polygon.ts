import type { DisplayObject, ParsedBaseStyleProps, ParsedPolygonStyleProps } from '@antv/g';
import { singleton } from '@antv/g';
import { CanvasRenderer } from '@antv/g-canvas';
import { generateRoughOptions } from '../util';

@singleton({
  token: CanvasRenderer.PolygonRendererContribution,
})
export class PolygonRenderer implements CanvasRenderer.StyleRenderer {
  hash: (parsedStyle: ParsedBaseStyleProps) => string;

  render(
    context: CanvasRenderingContext2D,
    parsedStyle: ParsedPolygonStyleProps,
    object: DisplayObject<any, any>,
  ) {
    const { points } = parsedStyle as ParsedPolygonStyleProps;
    // @see https://github.com/rough-stuff/rough/wiki#polygon-vertices--options
    // @ts-ignore
    context.roughCanvas.polygon(points.points, generateRoughOptions(object));
  }
}
