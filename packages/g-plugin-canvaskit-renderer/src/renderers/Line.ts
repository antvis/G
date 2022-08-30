import type { ParsedLineStyleProps } from '@antv/g-lite';
import { DisplayObject, singleton } from '@antv/g-lite';
import type { RendererContribution, RendererContributionContext } from '../interfaces';

/**
 * @see https://fiddle.skia.org/c/@Canvas_drawLine
 */
@singleton()
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
      x = x2 - x1;
      y = y2 - y1;
      rad = Math.atan2(y, x);
      startOffsetX = Math.cos(rad) * (markerStartOffset || 0);
      startOffsetY = Math.sin(rad) * (markerStartOffset || 0);
    }

    if (markerEnd && markerEnd instanceof DisplayObject && markerEndOffset) {
      x = x1 - x2;
      y = y1 - y2;
      rad = Math.atan2(y, x);
      endOffsetX = Math.cos(rad) * (markerEndOffset || 0);
      endOffsetY = Math.sin(rad) * (markerEndOffset || 0);
    }

    if (shadowStrokePaint) {
      canvas.drawLine(
        x1 - defX + (shadowOffsetX || 0) / 2 + startOffsetX,
        y1 - defY + (shadowOffsetY || 0) / 2 + startOffsetY,
        x2 - defX + (shadowOffsetX || 0) / 2 + endOffsetX,
        y2 - defY + (shadowOffsetY || 0) / 2 + endOffsetY,
        shadowStrokePaint,
      );
    }

    if (strokePaint) {
      canvas.drawLine(
        x1 - defX + startOffsetX,
        y1 - defY + startOffsetY,
        x2 - defX + endOffsetX,
        y2 - defY + endOffsetY,
        strokePaint,
      );
    }
  }
}
