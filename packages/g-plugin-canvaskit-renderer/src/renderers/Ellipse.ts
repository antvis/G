import type { DisplayObject, ParsedEllipseStyleProps } from '@antv/g';
import { singleton } from 'mana-syringe';
import type { RendererContribution, RendererContributionContext } from '../interfaces';
import { EllipseRendererContribution } from '../interfaces';

/**
 * @see https://fiddle.skia.org/c/@Canvas_drawOval
 * @example
 * SkRect bounds = SkRect::MakeWH(80, 70);
 */
@singleton({
  token: EllipseRendererContribution,
})
export class EllipseRenderer implements RendererContribution {
  render(object: DisplayObject, context: RendererContributionContext) {
    const { canvas, strokePaint, fillPaint, shadowFillPaint, shadowStrokePaint } = context;
    const { rx, ry, shadowOffsetX, shadowOffsetY } = object.parsedStyle as ParsedEllipseStyleProps;

    if (shadowFillPaint || shadowStrokePaint) {
      canvas.drawOval(
        [
          shadowOffsetX?.value || 0,
          shadowOffsetY?.value || 0,
          rx.value * 2 + (shadowOffsetX?.value || 0) / 2,
          ry.value * 2 + (shadowOffsetY?.value || 0) / 2,
        ],
        shadowFillPaint || shadowStrokePaint,
      );
    }

    if (fillPaint) {
      canvas.drawOval([0, 0, rx.value * 2, ry.value * 2], fillPaint);
    }
    if (strokePaint) {
      canvas.drawOval([0, 0, rx.value * 2, ry.value * 2], strokePaint);
    }
  }
}
