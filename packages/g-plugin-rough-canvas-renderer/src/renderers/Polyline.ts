import type { DisplayObject, ParsedBaseStyleProps, ParsedPolylineStyleProps } from '@antv/g';
import { singleton } from '@antv/g';
import { CanvasRenderer } from '@antv/g-canvas';
import { generateRoughOptions } from '../util';

@singleton({
  token: CanvasRenderer.PolylineRendererContribution,
})
export class PolylineRenderer implements CanvasRenderer.StyleRenderer {
  hash: (parsedStyle: ParsedBaseStyleProps) => string;

  render(
    context: CanvasRenderingContext2D,
    parsedStyle: ParsedPolylineStyleProps,
    object: DisplayObject<any, any>,
  ) {
    const { points } = parsedStyle as ParsedPolylineStyleProps;
    // @see https://github.com/rough-stuff/rough/wiki#linearpath-points--options
    // @ts-ignore
    context.roughCanvas.linearPath(points.points, generateRoughOptions(object));
  }
}
