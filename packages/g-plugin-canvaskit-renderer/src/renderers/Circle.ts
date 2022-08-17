import type { DisplayObject, ParsedCircleStyleProps } from '@antv/g';
import { singleton } from '@antv/g';
import type { RendererContribution, RendererContributionContext } from '../interfaces';
import { CircleRendererContribution } from '../interfaces';

@singleton({
  token: CircleRendererContribution,
})
export class CircleRenderer implements RendererContribution {
  render(object: DisplayObject, context: RendererContributionContext) {
    const { canvas, strokePaint, fillPaint, shadowFillPaint, shadowStrokePaint } = context;
    const { r, shadowOffsetX, shadowOffsetY } = object.parsedStyle as ParsedCircleStyleProps;

    if (shadowFillPaint || shadowStrokePaint) {
      canvas.drawCircle(
        r + (shadowOffsetX || 0) / 2,
        r + (shadowOffsetY || 0) / 2,
        r,
        shadowFillPaint || shadowStrokePaint,
      );
    }

    if (fillPaint) {
      canvas.drawCircle(r, r, r, fillPaint);
    }

    if (strokePaint) {
      canvas.drawCircle(r, r, r, strokePaint);
    }
  }
}
