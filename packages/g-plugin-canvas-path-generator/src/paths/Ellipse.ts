import type { ParsedEllipseStyleProps } from '@antv/g-lite';

export function generatePath(
  context: CanvasRenderingContext2D,
  parsedStyle: ParsedEllipseStyleProps,
) {
  const { cx = 0, cy = 0, rx, ry } = parsedStyle;

  // @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/ellipse
  if (context.ellipse) {
    context.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2, false);
  } else {
    // 如果不支持，则使用圆来绘制，进行变形
    const r = rx > ry ? rx : ry;
    const scaleX = rx > ry ? 1 : rx / ry;
    const scaleY = rx > ry ? ry / rx : 1;
    context.save();
    context.scale(scaleX, scaleY);
    context.arc(cx, cy, r, 0, Math.PI * 2);
  }
}
