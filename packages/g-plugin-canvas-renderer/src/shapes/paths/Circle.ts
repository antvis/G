import type { ParsedCircleStyleProps } from '@antv/g';

export function generatePath(
  context: CanvasRenderingContext2D,
  parsedStyle: ParsedCircleStyleProps,
) {
  const { rInPixels: r } = parsedStyle;
  // context.save();
  // context.moveTo(2 * r, r);
  context.arc(r, r, r, 0, Math.PI * 2, false);
  // context.restore();
}
