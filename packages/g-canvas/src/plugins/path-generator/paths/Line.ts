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
    markerStartOffset,
    markerEndOffset,
  } = parsedStyle;

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

  context.moveTo(x1 + startOffsetX, y1 + startOffsetY);
  context.lineTo(x2 + endOffsetX, y2 + endOffsetY);
}
