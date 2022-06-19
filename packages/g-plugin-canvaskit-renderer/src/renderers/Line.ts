import type { DisplayObject, ParsedLineStyleProps } from '@antv/g';
import { singleton } from '@antv/g';
import type { RendererContribution, RendererContributionContext } from '../interfaces';
import { LineRendererContribution } from '../interfaces';

/**
 * @see https://fiddle.skia.org/c/@Canvas_drawLine
 */
@singleton({
  token: LineRendererContribution,
})
export class LineRenderer implements RendererContribution {
  render(object: DisplayObject, context: RendererContributionContext) {
    const { canvas, strokePaint, shadowStrokePaint } = context;
    const { shadowOffsetX, shadowOffsetY, x1, y1, x2, y2 } =
      object.parsedStyle as ParsedLineStyleProps;

    if (shadowStrokePaint) {
      canvas.drawLine(
        x1.value + (shadowOffsetX?.value || 0) / 2,
        y1.value + (shadowOffsetY?.value || 0) / 2,
        x2.value + (shadowOffsetX?.value || 0) / 2,
        y2.value + (shadowOffsetY?.value || 0) / 2,
        shadowStrokePaint,
      );
    }

    if (strokePaint) {
      canvas.drawLine(x1.value, y1.value, x2.value, y2.value, strokePaint);
    }
  }
}
