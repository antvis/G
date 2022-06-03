import { DisplayObject, isNil, ParsedLineStyleProps } from '@antv/g';
import { singleton } from 'mana-syringe';
import {
  LineRendererContribution,
  RendererContribution,
  RendererContributionContext,
} from '../interfaces';

/**
 * @see https://fiddle.skia.org/c/@Canvas_drawLine
 */
@singleton({
  token: LineRendererContribution,
})
export class LineRenderer implements RendererContribution {
  render(object: DisplayObject, context: RendererContributionContext) {
    const { canvas, strokePaint, shadowPaint } = context;
    const { shadowColor, shadowOffsetX, shadowOffsetY, defX, defY, x1, y1, x2, y2 } =
      object.parsedStyle as ParsedLineStyleProps;

    if (!isNil(shadowColor)) {
      canvas.drawLine(
        x1.value - defX + (shadowOffsetX?.value || 0),
        y1.value - defY + (shadowOffsetY?.value || 0),
        x2.value - defX + (shadowOffsetX?.value || 0),
        y2.value - defY + (shadowOffsetY?.value || 0),
        shadowPaint,
      );
    }

    canvas.drawLine(
      x1.value - defX,
      y1.value - defY,
      x2.value - defX,
      y2.value - defY,
      strokePaint,
    );
  }
}
