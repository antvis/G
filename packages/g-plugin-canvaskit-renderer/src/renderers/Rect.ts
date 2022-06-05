import type { DisplayObject, ParsedRectStyleProps } from '@antv/g';
import { singleton } from 'mana-syringe';
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

    const rrect = [
      0,
      0,
      width.value,
      height.value,
      radius[0].value,
      radius[0].value,
      radius[1].value,
      radius[1].value,
      radius[2].value,
      radius[2].value,
      radius[3].value,
      radius[3].value,
    ];

    if (shadowFillPaint || shadowStrokePaint) {
      canvas.drawRRect(
        [
          (shadowOffsetX?.value || 0) / 2,
          (shadowOffsetY?.value || 0) / 2,
          width.value + (shadowOffsetX?.value || 0) / 2,
          height.value + (shadowOffsetY?.value || 0) / 2,
          radius[0].value,
          radius[0].value,
          radius[1].value,
          radius[1].value,
          radius[2].value,
          radius[2].value,
          radius[3].value,
          radius[3].value,
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
