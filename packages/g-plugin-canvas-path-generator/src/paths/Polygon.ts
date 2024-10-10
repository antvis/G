import type { ParsedPolygonStyleProps } from '@antv/g-lite';
import { isDisplayObject } from '@antv/g-lite';

export function generatePath(
  context: CanvasRenderingContext2D,
  parsedStyle: ParsedPolygonStyleProps,
) {
  const { markerStart, markerEnd, markerStartOffset, markerEndOffset } =
    parsedStyle;
  const { points } = parsedStyle.points;
  const { length } = points;

  const x1 = points[0][0];
  const y1 = points[0][1];
  const x2 = points[length - 1][0];
  const y2 = points[length - 1][1];

  let startOffsetX = 0;
  let startOffsetY = 0;
  let endOffsetX = 0;
  let endOffsetY = 0;

  let rad = 0;
  let x: number;
  let y: number;

  if (markerStart && isDisplayObject(markerStart) && markerStartOffset) {
    x = points[1][0] - points[0][0];
    y = points[1][1] - points[0][1];
    rad = Math.atan2(y, x);
    startOffsetX = Math.cos(rad) * (markerStartOffset || 0);
    startOffsetY = Math.sin(rad) * (markerStartOffset || 0);
  }

  if (markerEnd && isDisplayObject(markerEnd) && markerEndOffset) {
    x = points[length - 1][0] - points[0][0];
    y = points[length - 1][1] - points[0][1];
    rad = Math.atan2(y, x);
    endOffsetX = Math.cos(rad) * (markerEndOffset || 0);
    endOffsetY = Math.sin(rad) * (markerEndOffset || 0);
  }

  context.moveTo(
    x1 + (startOffsetX || endOffsetX),
    y1 + (startOffsetY || endOffsetY),
  );
  for (let i = 1; i < length - 1; i++) {
    const point = points[i];
    context.lineTo(point[0], point[1]);
  }
  context.lineTo(x2, y2);
}
