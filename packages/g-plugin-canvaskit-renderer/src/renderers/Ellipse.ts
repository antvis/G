import type { DisplayObject, ParsedEllipseStyleProps } from '@antv/g-lite';
import type {
  RendererContribution,
  RendererContributionContext,
} from '../interfaces';

/**
 * @see https://fiddle.skia.org/c/@Canvas_drawOval
 * @example
 * SkRect bounds = SkRect::MakeWH(80, 70);
 */
export class EllipseRenderer implements RendererContribution {
  render(object: DisplayObject, context: RendererContributionContext) {
    const {
      canvas,
      strokePaint,
      fillPaint,
      shadowFillPaint,
      shadowStrokePaint,
    } = context;
    const { cx, cy, rx, ry, shadowOffsetX, shadowOffsetY } =
      object.parsedStyle as ParsedEllipseStyleProps;

    if (shadowFillPaint || shadowStrokePaint) {
      canvas.drawOval(
        [
          cx - rx + (shadowOffsetX || 0),
          cy - ry + (shadowOffsetY || 0),
          cx + rx + (shadowOffsetX || 0),
          cy + ry + (shadowOffsetY || 0),
        ],
        shadowFillPaint || shadowStrokePaint,
      );
    }

    if (fillPaint) {
      canvas.drawOval([cx - rx, cy - ry, cx + rx, cy + ry], fillPaint);
    }
    if (strokePaint) {
      canvas.drawOval([cx - rx, cy - ry, cx + rx, cy + ry], strokePaint);
    }
  }
}
