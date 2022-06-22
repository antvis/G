import type { ParsedPolygonStyleProps } from '@antv/g';

export function generatePath(
  context: CanvasRenderingContext2D,
  parsedStyle: ParsedPolygonStyleProps,
) {
  const { defX = 0, defY = 0 } = parsedStyle;
  const points = parsedStyle.points.points;
  const length = points.length;

  const x1 = points[0][0] - defX;
  const y1 = points[0][1] - defY;
  const x2 = points[length - 1][0] - defX;
  const y2 = points[length - 1][1] - defY;

  context.moveTo(x1, y1);
  for (let i = 0; i < length - 1; i++) {
    const point = points[i];
    context.lineTo(point[0] - defX, point[1] - defY);
  }
  context.lineTo(x2, y2);
}
