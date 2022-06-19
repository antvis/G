import type { ParsedLineStyleProps } from '@antv/g';

export function generatePath(context: CanvasRenderingContext2D, parsedStyle: ParsedLineStyleProps) {
  const { x1, y1, x2, y2 } = parsedStyle;
  context.moveTo(x1.value, y1.value);
  context.lineTo(x2.value, y2.value);
}
