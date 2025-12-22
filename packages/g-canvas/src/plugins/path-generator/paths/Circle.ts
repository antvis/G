import type { ParsedCircleStyleProps } from '@antv/g-lite';

export function generatePath(
  context: CanvasRenderingContext2D,
  parsedStyle: ParsedCircleStyleProps,
) {
  const { cx = 0, cy = 0, r } = parsedStyle;
  context.arc(cx, cy, r, 0, Math.PI * 2, false);
}
