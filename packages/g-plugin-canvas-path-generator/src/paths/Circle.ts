import type { Circle } from '@antv/g-lite';

export function generatePath(
  context: CanvasRenderingContext2D,
  circle: Circle,
) {
  const { cx = 0, cy = 0, r } = circle.attributes;
  context.arc(cx, cy, r, 0, Math.PI * 2, false);
}
