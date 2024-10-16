import type { ParsedEllipseStyleProps } from '@antv/g-lite';
import { TWO_PI } from '../constants';

export function generatePath(
  context: CanvasRenderingContext2D,
  parsedStyle: ParsedEllipseStyleProps,
) {
  const { cx = 0, cy = 0, rx, ry } = parsedStyle;

  // @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/ellipse
  if (context.ellipse) {
    context.ellipse(cx, cy, rx, ry, 0, 0, TWO_PI, false);
  } else {
    // 如果不支持，则使用圆来绘制，进行变形
    let r, scaleX, scaleY;
    if (rx > ry) {
      r = rx;
      scaleX = 1;
      scaleY = ry / rx;
    } else {
      r = ry;
      scaleX = rx / ry;
      scaleY = 1;
    }

    context.save();
    context.scale(scaleX, scaleY);
    context.arc(cx, cy, r, 0, TWO_PI);
  }
}
