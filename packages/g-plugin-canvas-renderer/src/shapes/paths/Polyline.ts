import type { PolylineStyleProps } from '@antv/g';

export function generatePath(context: CanvasRenderingContext2D, attributes: PolylineStyleProps) {
  const { x = 0, y = 0 } = attributes;
  // @ts-ignore
  const points = attributes.points as number[][];
  const { length } = points;

  const x1 = points[0][0] - x;
  const y1 = points[0][1] - y;
  const x2 = points[length - 1][0] - x;
  const y2 = points[length - 1][1] - y;

  context.beginPath();
  context.moveTo(x1, y1);
  for (let i = 0; i < length - 1; i++) {
    const point = points[i];
    context.lineTo(point[0] - x, point[1] - y);
  }
  context.lineTo(x2, y2);
}
