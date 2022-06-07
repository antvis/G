import type { DisplayObject, ParsedBaseStyleProps, ParsedPolylineStyleProps } from '@antv/g';
import { singleton } from '@antv/g';
import type { StyleRenderer } from '@antv/g-plugin-canvas-renderer';
import { PolylineRendererContribution } from '@antv/g-plugin-canvas-renderer';
import { generateRoughOptions } from '../util';

@singleton({
  token: PolylineRendererContribution,
})
export class PolylineRenderer implements StyleRenderer {
  hash: (parsedStyle: ParsedBaseStyleProps) => string;

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
