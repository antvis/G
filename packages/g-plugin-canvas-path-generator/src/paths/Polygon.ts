import { DisplayObject, ParsedPolygonStyleProps } from '@antv/g';

export function generatePath(
  context: CanvasRenderingContext2D,
  parsedStyle: ParsedPolygonStyleProps,
) {
  const {
    defX = 0,
    defY = 0,
    markerStart,
    markerEnd,
    markerStartOffset,
    markerEndOffset,
  } = parsedStyle;
  const points = parsedStyle.points.points;
  const length = points.length;

  const x1 = points[0][0] - defX;
  const y1 = points[0][1] - defY;
  const x2 = points[length - 1][0] - defX;
  const y2 = points[length - 1][1] - defY;

  let startOffsetX = 0;
  let startOffsetY = 0;
  let endOffsetX = 0;
  let endOffsetY = 0;

  let rad = 0;
  let x: number;
  let y: number;

  if (markerStart && markerStart instanceof DisplayObject && markerStartOffset) {
    x = points[1][0] - points[0][0];
    y = points[1][1] - points[0][1];
    rad = Math.atan2(y, x);
    startOffsetX = Math.cos(rad) * (markerStartOffset || 0);
    startOffsetY = Math.sin(rad) * (markerStartOffset || 0);
  }

  if (markerEnd && markerEnd instanceof DisplayObject && markerEndOffset) {
    x = points[length - 2][0] - points[length - 1][0];
    y = points[length - 2][1] - points[length - 1][1];
    rad = Math.atan2(y, x);
    endOffsetX = Math.cos(rad) * (markerEndOffset || 0);
    endOffsetY = Math.sin(rad) * (markerEndOffset || 0);
  }

  context.moveTo(x1 + startOffsetX, y1 + startOffsetY);
  for (let i = 1; i < length - 1; i++) {
    const point = points[i];
    context.lineTo(point[0] - defX, point[1] - defY);
  }
  context.lineTo(x2 + endOffsetX, y2 + endOffsetY);
}
