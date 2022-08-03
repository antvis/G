import type { ParsedLineStyleProps } from '@antv/g';
import { DisplayObject, singleton } from '@antv/g';
import type { RendererContribution, RendererContributionContext } from '../interfaces';
import { LineRendererContribution } from '../interfaces';

/**
 * @see https://fiddle.skia.org/c/@Canvas_drawLine
 */
@singleton({
  token: LineRendererContribution,
})
export class LineRenderer implements RendererContribution {
  render(object: DisplayObject, context: RendererContributionContext) {
    const { canvas, strokePaint, shadowStrokePaint } = context;
    const {
      shadowOffsetX,
      shadowOffsetY,
      defX,
      defY,
      x1,
      y1,
      x2,
      y2,
      markerStart,
      markerEnd,
      markerStartOffset,
      markerEndOffset,
    } = object.parsedStyle as ParsedLineStyleProps;

    let startOffsetX = 0;
    let startOffsetY = 0;
    let endOffsetX = 0;
    let endOffsetY = 0;

    let rad = 0;
    let x: number;
    let y: number;

    if (markerStart && markerStart instanceof DisplayObject && markerStartOffset) {
      x = x2.value - x1.value;
      y = y2.value - y1.value;
      rad = Math.atan2(y, x);
      startOffsetX = Math.cos(rad) * (markerStartOffset?.value || 0);
      startOffsetY = Math.sin(rad) * (markerStartOffset?.value || 0);
    }

    if (markerEnd && markerEnd instanceof DisplayObject && markerEndOffset) {
      x = x1.value - x2.value;
      y = y1.value - y2.value;
      rad = Math.atan2(y, x);
      endOffsetX = Math.cos(rad) * (markerEndOffset?.value || 0);
      endOffsetY = Math.sin(rad) * (markerEndOffset?.value || 0);
    }

    if (shadowStrokePaint) {
      canvas.drawLine(
        x1.value - defX + (shadowOffsetX?.value || 0) / 2 + startOffsetX,
        y1.value - defY + (shadowOffsetY?.value || 0) / 2 + startOffsetY,
        x2.value - defX + (shadowOffsetX?.value || 0) / 2 + endOffsetX,
        y2.value - defY + (shadowOffsetY?.value || 0) / 2 + endOffsetY,
        shadowStrokePaint,
      );
    }

    if (strokePaint) {
      canvas.drawLine(
        x1.value - defX + startOffsetX,
        y1.value - defY + startOffsetY,
        x2.value - defX + endOffsetX,
        y2.value - defY + endOffsetY,
        strokePaint,
      );
    }
  }
}
