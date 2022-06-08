import { clamp, ParsedRectStyleProps } from '@antv/g';

export function generatePath(context: CanvasRenderingContext2D, parsedStyle: ParsedRectStyleProps) {
  const { radius, width, height } = parsedStyle;

  const w = width.value;
  const h = height.value;
  const hasRadius = radius && radius.some((r) => r.value !== 0);

  if (!hasRadius) {
    context.rect(0, 0, w, h);
  } else {
    const [r1, r2, r3, r4] = radius.map((r) => clamp(r.value, 0, Math.min(w / 2, h / 2)));
    context.moveTo(r1, 0);
    context.lineTo(w - r2, 0);
    if (r2 !== 0) {
      context.arc(w - r2, r2, r2, -Math.PI / 2, 0);
    }
    context.lineTo(w, h - r3);
    if (r3 !== 0) {
      context.arc(w - r3, h - r3, r3, 0, Math.PI / 2);
    }
    context.lineTo(r4, h);
    if (r4 !== 0) {
      context.arc(r4, h - r4, r4, Math.PI / 2, Math.PI);
    }
    context.lineTo(0, r1);
    if (r1 !== 0) {
      context.arc(r1, r1, r1, Math.PI, Math.PI * 1.5);
    }
  }
}
