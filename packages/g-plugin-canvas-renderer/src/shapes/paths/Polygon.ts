import { ParsedBaseStyleProps } from '@antv/g';

export function generatePath(context: CanvasRenderingContext2D, parsedStyle: ParsedBaseStyleProps) {
  const { defX: x = 0, defY: y = 0 } = parsedStyle;
  const points = parsedStyle.points!.points;
  const length = points.length;

  let x1 = points[0][0] - x;
  let y1 = points[0][1] - y;
  let x2 = points[length - 1][0] - x;
  let y2 = points[length - 1][1] - y;

  context.moveTo(x1, y1);
  for (let i = 0; i < length - 1; i++) {
    const point = points[i];
    context.lineTo(point[0] - x, point[1] - y);
  }
  context.lineTo(x2, y2);
}
