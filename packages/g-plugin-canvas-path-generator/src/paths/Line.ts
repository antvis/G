import type { ParsedLineStyleProps } from '@antv/g';
import { DisplayObject } from '@antv/g';

export function generatePath(context: CanvasRenderingContext2D, parsedStyle: ParsedLineStyleProps) {
  const {
    x1,
    y1,
    x2,
    y2,
    defX = 0,
    defY = 0,
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

  context.moveTo(x1 - defX + startOffsetX, y1 - defY + startOffsetY);
  context.lineTo(x2 - defX + endOffsetX, y2 - defY + endOffsetY);
}
