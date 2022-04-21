import type { ParsedCircleStyleProps } from '@antv/g';

export function generatePath(
  context: CanvasRenderingContext2D,
  parsedStyle: ParsedCircleStyleProps,
) {
  const { r } = parsedStyle;
  context.arc(r.value, r.value, r.value, 0, Math.PI * 2, false);
}
