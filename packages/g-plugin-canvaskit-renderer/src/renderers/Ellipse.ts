import { DisplayObject, isNil, ParsedEllipseStyleProps } from '@antv/g';
import { singleton } from 'mana-syringe';
import {
  EllipseRendererContribution,
  RendererContribution,
  RendererContributionContext,
} from '../interfaces';

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
    const { canvas, strokePaint, fillPaint, shadowPaint } = context;
    const { rx, ry, shadowColor, shadowOffsetX, shadowOffsetY } =
      object.parsedStyle as ParsedEllipseStyleProps;

    if (!isNil(shadowColor)) {
      canvas.drawOval(
        [
          shadowOffsetX?.value || 0,
          shadowOffsetY?.value || 0,
          rx.value * 2 + (shadowOffsetX?.value || 0),
          ry.value * 2 + (shadowOffsetY?.value || 0),
        ],
        shadowPaint,
      );
    }

    canvas.drawOval([0, 0, rx.value * 2, ry.value * 2], fillPaint);
    canvas.drawOval([0, 0, rx.value * 2, ry.value * 2], strokePaint);
  }
}
