import { DisplayObject, isNil, ParsedCircleStyleProps } from '@antv/g';
import { singleton } from 'mana-syringe';
import {
  CircleRendererContribution,
  RendererContribution,
  RendererContributionContext,
} from '../interfaces';

@singleton({
  token: CircleRendererContribution,
})
export class CircleRenderer implements RendererContribution {
  render(object: DisplayObject, context: RendererContributionContext) {
    const { canvas, strokePaint, fillPaint, shadowPaint } = context;
    const { r, shadowColor, shadowOffsetX, shadowOffsetY } =
      object.parsedStyle as ParsedCircleStyleProps;

    if (!isNil(shadowColor)) {
      canvas.drawCircle(
        r.value + (shadowOffsetX?.value || 0) / 2,
        r.value + (shadowOffsetY?.value || 0) / 2,
        r.value,
        shadowPaint,
      );
    }

    canvas.drawCircle(r.value, r.value, r.value, fillPaint);
    canvas.drawCircle(r.value, r.value, r.value, strokePaint);
  }
}
