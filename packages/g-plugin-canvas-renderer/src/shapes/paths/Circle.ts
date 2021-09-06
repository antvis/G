import { ParsedCircleStyleProps } from '@antv/g';

export function generatePath(
  context: CanvasRenderingContext2D,
  parsedStyle: ParsedCircleStyleProps,
) {
  context.beginPath();
  const { r = 0 } = parsedStyle;
  context.arc(r, r, r, 0, Math.PI * 2, false);
}
