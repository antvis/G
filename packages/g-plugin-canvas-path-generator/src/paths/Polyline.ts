import type { ParsedPolylineStyleProps } from '@antv/g-lite';
import { isDisplayObject } from '@antv/g-lite';

export function generatePath(
  context: CanvasRenderingContext2D,
  parsedStyle: ParsedPolylineStyleProps,
) {
  const {
    markerStart,
    markerEnd,
    markerStartOffset = 0,
    markerEndOffset = 0,
  } = parsedStyle;
  const { points } = parsedStyle.points;
  const length = points.length;
  const lengthMinusOne = length - 1;
  const lengthMinusTwo = length - 2;

  const x1 = points[0][0];
  const y1 = points[0][1];
  const x2 = points[lengthMinusOne][0];
  const y2 = points[lengthMinusOne][1];

  let startOffsetX = 0;
  let startOffsetY = 0;
  let endOffsetX = 0;
  let endOffsetY = 0;

  if (isDisplayObject(markerStart) && markerStartOffset) {
    const rad = Math.atan2(
      points[1][1] - points[0][1],
      points[1][0] - points[0][0],
    );
    startOffsetX = Math.cos(rad) * markerStartOffset;
    startOffsetY = Math.sin(rad) * markerStartOffset;
  }

  if (isDisplayObject(markerEnd) && markerEndOffset) {
    const rad = Math.atan2(
      points[lengthMinusTwo][1] - points[lengthMinusOne][1],
      points[lengthMinusTwo][0] - points[lengthMinusOne][0],
    );
    endOffsetX = Math.cos(rad) * markerEndOffset;
    endOffsetY = Math.sin(rad) * markerEndOffset;
  }

  context.moveTo(x1 + startOffsetX, y1 + startOffsetY);
  for (let i = 1; i < lengthMinusOne; i++) {
    context.lineTo(points[i][0], points[i][1]);
  }
  context.lineTo(x2 + endOffsetX, y2 + endOffsetY);
}
