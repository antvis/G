import type { ParsedCircleStyleProps } from '@antv/g-lite';

export function generatePath(
  context: CanvasRenderingContext2D,
  parsedStyle: ParsedCircleStyleProps,
) {
  const { cx, cy, r } = parsedStyle;
  context.arc(cx, cy, r, 0, Math.PI * 2, false);
}
