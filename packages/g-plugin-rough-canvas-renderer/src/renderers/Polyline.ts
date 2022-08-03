import type { DisplayObject, ParsedPolylineStyleProps } from '@antv/g';
import { singleton } from '@antv/g';
import { CanvasRenderer } from '@antv/g-canvas';
import { generateRoughOptions } from '../util';

@singleton({
  token: CanvasRenderer.PolylineRendererContribution,
})
export class PolylineRenderer implements CanvasRenderer.StyleRenderer {
  render(
    context: CanvasRenderingContext2D,
    parsedStyle: ParsedPolylineStyleProps,
    object: DisplayObject<any, any>,
  ) {
    const { points, defX = 0, defY = 0 } = parsedStyle as ParsedPolylineStyleProps;
    // @see https://github.com/rough-stuff/rough/wiki#linearpath-points--options
    // @ts-ignore
    context.roughCanvas.linearPath(
      points.points.map(([x, y]) => [x - defX, y - defY]),
      generateRoughOptions(object),
    );
  }
}
