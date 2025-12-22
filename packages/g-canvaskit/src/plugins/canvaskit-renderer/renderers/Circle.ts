import type { DisplayObject, ParsedCircleStyleProps } from '@antv/g-lite';
import type {
  RendererContribution,
  RendererContributionContext,
} from '../interfaces';

export class CircleRenderer implements RendererContribution {
  render(object: DisplayObject, context: RendererContributionContext) {
    const {
      canvas,
      strokePaint,
      fillPaint,
      shadowFillPaint,
      shadowStrokePaint,
    } = context;
    const { cx, cy, r, shadowOffsetX, shadowOffsetY } =
      object.parsedStyle as ParsedCircleStyleProps;

    if (shadowFillPaint || shadowStrokePaint) {
      canvas.drawCircle(
        cx + (shadowOffsetX || 0) / 2,
        cy + (shadowOffsetY || 0) / 2,
        r,
        shadowFillPaint || shadowStrokePaint,
      );
    }

    if (fillPaint) {
      canvas.drawCircle(cx, cy, r, fillPaint);
    }

    if (strokePaint) {
      canvas.drawCircle(cx, cy, r, strokePaint);
    }
  }
}
