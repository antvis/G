import type { ParsedRectStyleProps } from '@antv/g-lite';
import { clamp } from '@antv/util';

export function generatePath(
  context: CanvasRenderingContext2D,
  parsedStyle: ParsedRectStyleProps,
) {
  const { x = 0, y = 0, radius, width, height } = parsedStyle;

  const w = width;
  const h = height;
  const hasRadius = radius && radius.some((r) => r !== 0);

  if (!hasRadius) {
    // Canvas support negative width/height of rect
    context.rect(x, y, w, h);
  } else {
    const signX = width > 0 ? 1 : -1;
    const signY = height > 0 ? 1 : -1;
    const sweepFlag = signX + signY === 0;
    const [tlr, trr, brr, blr] = radius.map((r) =>
      clamp(r, 0, Math.min(Math.abs(w) / 2, Math.abs(h) / 2)),
    );

    context.moveTo(signX * tlr + x, y);
    context.lineTo(w - signX * trr + x, y);
    if (trr !== 0) {
      context.arc(
        w - signX * trr + x,
        signY * trr + y,
        trr,
        (-signY * Math.PI) / 2,
        signX > 0 ? 0 : Math.PI,
        sweepFlag,
      );
    }
    context.lineTo(w + x, h - signY * brr + y);
    if (brr !== 0) {
      context.arc(
        w - signX * brr + x,
        h - signY * brr + y,
        brr,
        signX > 0 ? 0 : Math.PI,
        signY > 0 ? Math.PI / 2 : 1.5 * Math.PI,
        sweepFlag,
      );
    }
    context.lineTo(signX * blr + x, h + y);
    if (blr !== 0) {
      context.arc(
        signX * blr + x,
        h - signY * blr + y,
        blr,
        signY > 0 ? Math.PI / 2 : -Math.PI / 2,
        signX > 0 ? Math.PI : 0,
        sweepFlag,
      );
    }
    context.lineTo(x, signY * tlr + y);
    if (tlr !== 0) {
      context.arc(
        signX * tlr + x,
        signY * tlr + y,
        tlr,
        signX > 0 ? Math.PI : 0,
        signY > 0 ? Math.PI * 1.5 : Math.PI / 2,
        sweepFlag,
      );
    }
  }
}
