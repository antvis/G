import type { DisplayObject, ParsedRectStyleProps } from '@antv/g-lite';
import { singleton } from '@antv/g-lite';
import { clamp } from '@antv/util';
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
      clamp(r, 0, Math.min(Math.abs(width) / 2, Math.abs(height) / 2)),
    );

    const flipY = width < 0;
    const flipX = height < 0;

    let tlr: number;
    let trr: number;
    let brr: number;
    let blr: number;
    if (!flipX && !flipY) {
      tlr = r1;
      trr = r2;
      brr = r3;
      blr = r4;
    } else if (flipX && flipY) {
      tlr = r3;
      trr = r4;
      brr = r1;
      blr = r2;
    } else if (flipX && !flipY) {
      tlr = r4;
      trr = r3;
      brr = r2;
      blr = r1;
    } else if (!flipX && flipY) {
      tlr = r2;
      trr = r1;
      brr = r4;
      blr = r3;
    }

    const rrect = [0, 0, width, height, tlr, tlr, trr, trr, brr, brr, blr, blr];
    if (shadowFillPaint || shadowStrokePaint) {
      canvas.drawRRect(
        [
          (shadowOffsetX || 0) / 2,
          (shadowOffsetY || 0) / 2,
          width + (shadowOffsetX || 0) / 2,
          height + (shadowOffsetY || 0) / 2,
          tlr,
          tlr,
          trr,
          trr,
          brr,
          brr,
          blr,
          blr,
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
