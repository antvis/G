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

  context.moveTo(x1.value - defX + startOffsetX, y1.value - defY + startOffsetY);
  context.lineTo(x2.value - defX + endOffsetX, y2.value - defY + endOffsetY);
}
