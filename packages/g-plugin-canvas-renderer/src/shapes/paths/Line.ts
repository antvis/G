import { ParsedLineStyleProps } from '@antv/g';

export function generatePath(context: CanvasRenderingContext2D, parsedStyle: ParsedLineStyleProps) {
  const { x1, y1, x2, y2, defX = 0, defY = 0 } = parsedStyle;
  context.moveTo(x1 - defX, y1 - defY);
  context.lineTo(x2 - defX, y2 - defY);
}
