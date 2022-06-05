import type { DisplayObject, ParsedCircleStyleProps } from '@antv/g';
import { singleton } from 'mana-syringe';
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
        r.value + (shadowOffsetX?.value || 0) / 2,
        r.value + (shadowOffsetY?.value || 0) / 2,
        r.value,
        shadowFillPaint || shadowStrokePaint,
      );
    }

    if (fillPaint) {
      canvas.drawCircle(r.value, r.value, r.value, fillPaint);
    }

    if (strokePaint) {
      canvas.drawCircle(r.value, r.value, r.value, strokePaint);
    }
  }
}
