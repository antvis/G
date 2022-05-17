import { singleton } from 'mana-syringe';
import type { DisplayObject, ParsedBaseStyleProps, ParsedLineStyleProps } from '@antv/g';
import type { StyleRenderer } from '@antv/g-plugin-canvas-renderer';
import { LineRendererContribution } from '@antv/g-plugin-canvas-renderer';
import { generateRoughOptions } from '../util';

@singleton({
  token: LineRendererContribution,
})
export class LineRenderer implements StyleRenderer {
  hash: (parsedStyle: ParsedBaseStyleProps) => string;

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
