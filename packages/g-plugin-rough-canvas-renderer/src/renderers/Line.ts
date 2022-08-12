import type { DisplayObject, ParsedLineStyleProps } from '@antv/g';
import { singleton } from '@antv/g';
import { CanvasRenderer } from '@antv/g-canvas';
import { generateRoughOptions } from '../util';

@singleton({
  token: CanvasRenderer.LineRendererContribution,
})
export class LineRenderer implements CanvasRenderer.StyleRenderer {
  render(
    context: CanvasRenderingContext2D,
    parsedStyle: ParsedLineStyleProps,
    object: DisplayObject<any, any>,
  ) {
    const { x1, y1, x2, y2, defX = 0, defY = 0 } = parsedStyle as ParsedLineStyleProps;
    // @see https://github.com/rough-stuff/rough/wiki#line-x1-y1-x2-y2--options
    // @ts-ignore
    context.roughCanvas.line(
      x1.value - defX,
      y1.value - defY,
      x2.value - defX,
      y2.value - defY,
      generateRoughOptions(object),
    );
  }
}
