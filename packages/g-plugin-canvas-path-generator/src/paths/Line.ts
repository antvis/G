import type { ParsedLineStyleProps } from '@antv/g-lite';
import { isDisplayObject } from '@antv/g-lite';

export function generatePath(
  context: CanvasRenderingContext2D,
  parsedStyle: ParsedLineStyleProps,
) {
  const {
    x1,
    y1,
    x2,
    y2,
    markerStart,
    markerEnd,
    markerStartOffset = 0,
    markerEndOffset = 0,
  } = parsedStyle;

  let startOffsetX = 0;
  let startOffsetY = 0;
  let endOffsetX = 0;
  let endOffsetY = 0;

  if (isDisplayObject(markerStart) && markerStartOffset) {
    const rad = Math.atan2(y2 - y1, x2 - x1);
    startOffsetX = Math.cos(rad) * markerStartOffset;
    startOffsetY = Math.sin(rad) * markerStartOffset;
  }

  if (isDisplayObject(markerEnd) && markerEndOffset) {
    const rad = Math.atan2(y1 - y2, x1 - x2);
    endOffsetX = Math.cos(rad) * markerEndOffset;
    endOffsetY = Math.sin(rad) * markerEndOffset;
  }

  context.moveTo(x1 + startOffsetX, y1 + startOffsetY);
  context.lineTo(x2 + endOffsetX, y2 + endOffsetY);
}
