import type { ParsedLineStyleProps } from '@antv/g-lite';
import { DisplayObject, isDisplayObject } from '@antv/g-lite';
import type {
  RendererContribution,
  RendererContributionContext,
} from '../interfaces';

/**
 * @see https://fiddle.skia.org/c/@Canvas_drawLine
 */
export class LineRenderer implements RendererContribution {
  render(object: DisplayObject, context: RendererContributionContext) {
    const { canvas, strokePaint, shadowStrokePaint } = context;
    const {
      shadowOffsetX,
      shadowOffsetY,
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

    if (markerStart && isDisplayObject(markerStart) && markerStartOffset) {
      x = x2 - x1;
      y = y2 - y1;
      rad = Math.atan2(y, x);
      startOffsetX = Math.cos(rad) * (markerStartOffset || 0);
      startOffsetY = Math.sin(rad) * (markerStartOffset || 0);
    }

    if (markerEnd && isDisplayObject(markerEnd) && markerEndOffset) {
      x = x1 - x2;
      y = y1 - y2;
      rad = Math.atan2(y, x);
      endOffsetX = Math.cos(rad) * (markerEndOffset || 0);
      endOffsetY = Math.sin(rad) * (markerEndOffset || 0);
    }

    if (shadowStrokePaint) {
      canvas.drawLine(
        x1 + (shadowOffsetX || 0) / 2 + startOffsetX,
        y1 + (shadowOffsetY || 0) / 2 + startOffsetY,
        x2 + (shadowOffsetX || 0) / 2 + endOffsetX,
        y2 + (shadowOffsetY || 0) / 2 + endOffsetY,
        shadowStrokePaint,
      );
    }

    if (strokePaint) {
      canvas.drawLine(
        x1 + startOffsetX,
        y1 + startOffsetY,
        x2 + endOffsetX,
        y2 + endOffsetY,
        strokePaint,
      );
    }
  }
}
