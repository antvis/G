import type { DisplayObject, ParsedRectStyleProps } from '@antv/g';
import { clamp, singleton } from '@antv/g';
import type { RendererContribution, RendererContributionContext } from '../interfaces';
import { RectRendererContribution } from '../interfaces';

/**
 * should account for round rect(RRect)
 * @see https://fiddle.skia.org/c/@Canvas_drawRoundRect
 *
 * An RRect (rectangle with rounded corners) is represented by 12 floats. In order, the floats
 * correspond to left, top, right, bottom and then in pairs, the radiusX, radiusY for upper-left,
 * upper-right, lower-right, lower-left. See RRect.h for more.
 */
@singleton({
  token: RectRendererContribution,
})
export class RectRenderer implements RendererContribution {
  render(object: DisplayObject, context: RendererContributionContext) {
    const { canvas, strokePaint, fillPaint, shadowFillPaint, shadowStrokePaint } = context;
    const { width, height, radius, shadowOffsetX, shadowOffsetY } =
      object.parsedStyle as ParsedRectStyleProps;

    const [r1, r2, r3, r4] = radius.map((r) =>
      clamp(r.value, 0, Math.min(width.value / 2, height.value / 2)),
    );

    const rrect = [
      0,
      0,
      width.value,
      height.value,
      r1[0],
      r1[1],
      r2[0],
      r2[1],
      r3[0],
      r3[1],
      r4[0],
      r4[1],
    ];

    if (shadowFillPaint || shadowStrokePaint) {
      canvas.drawRRect(
        [
          (shadowOffsetX?.value || 0) / 2,
          (shadowOffsetY?.value || 0) / 2,
          width.value + (shadowOffsetX?.value || 0) / 2,
          height.value + (shadowOffsetY?.value || 0) / 2,
          r1[0],
          r1[1],
          r2[0],
          r2[1],
          r3[0],
          r3[1],
          r4[0],
          r4[1],
        ],
        fillPaint ? shadowFillPaint : shadowStrokePaint,
      );
    }

    if (fillPaint) {
      canvas.drawRRect(rrect, fillPaint);
    }
    if (strokePaint) {
      canvas.drawRRect(rrect, strokePaint);
    }
  }
}
