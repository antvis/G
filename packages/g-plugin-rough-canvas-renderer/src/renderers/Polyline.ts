import type { CanvasRenderer } from '@antv/g-canvas';
import type { DisplayObject, ParsedPolylineStyleProps } from '@antv/g-lite';
import { generateRoughOptions } from '../util';

export class PolylineRenderer implements CanvasRenderer.StyleRenderer {
  render(
    context: CanvasRenderingContext2D,
    parsedStyle: ParsedPolylineStyleProps,
    object: DisplayObject<any, any>,
  ) {
    const { points } = parsedStyle;
    // @see https://github.com/rough-stuff/rough/wiki#linearpath-points--options
    // @ts-ignore
    context.roughCanvas.linearPath(
      points.points.map(([x, y]) => [x, y]),
      generateRoughOptions(object),
    );
  }
}
