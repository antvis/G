import type { ParsedPolygonStyleProps } from '@antv/g';

export function generatePath(
  context: CanvasRenderingContext2D,
  parsedStyle: ParsedPolygonStyleProps,
) {
  const points = parsedStyle.points.points;
  const length = points.length;

  const x1 = points[0][0];
  const y1 = points[0][1];
  const x2 = points[length - 1][0];
  const y2 = points[length - 1][1];

  context.moveTo(x1, y1);
  for (let i = 0; i < length - 1; i++) {
    const point = points[i];
    context.lineTo(point[0], point[1]);
  }
  context.lineTo(x2, y2);
}
