import { DisplayObject, isNil, ParsedRectStyleProps } from '@antv/g';
import { singleton } from 'mana-syringe';
import {
  RectRendererContribution,
  RendererContribution,
  RendererContributionContext,
} from '../interfaces';

/**
 * @see https://fiddle.skia.org/c/@Canvas_drawOval
 * @example
 * SkRect bounds = SkRect::MakeWH(80, 70);
 */
@singleton({
  token: RectRendererContribution,
})
export class RectRenderer implements RendererContribution {
  render(object: DisplayObject, context: RendererContributionContext) {
    const { canvas, strokePaint, fillPaint, shadowPaint } = context;
    const { width, height, shadowColor, shadowOffsetX, shadowOffsetY } =
      object.parsedStyle as ParsedRectStyleProps;

    if (!isNil(shadowColor)) {
      canvas.drawRect(
        [
          shadowOffsetX?.value || 0,
          shadowOffsetY?.value || 0,
          width.value + (shadowOffsetX?.value || 0),
          height.value + (shadowOffsetY?.value || 0),
        ],
        shadowPaint,
      );
    }

    canvas.drawRect([0, 0, width.value, height.value], fillPaint);
    canvas.drawRect([0, 0, width.value, height.value], strokePaint);
  }
}
