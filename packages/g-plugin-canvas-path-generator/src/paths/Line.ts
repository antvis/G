import type { ParsedLineStyleProps } from '@antv/g';

export function generatePath(context: CanvasRenderingContext2D, parsedStyle: ParsedLineStyleProps) {
  const { x1, y1, x2, y2, defX = 0, defY = 0 } = parsedStyle;
  context.moveTo(x1.value - defX, y1.value - defY);
  context.lineTo(x2.value - defX, y2.value - defY);
}
