import type { ParsedRectStyleProps } from '@antv/g-lite';
import { clamp } from '@antv/util';

export function generatePath(context: CanvasRenderingContext2D, parsedStyle: ParsedRectStyleProps) {
  const { radius, width, height } = parsedStyle;

  const w = width;
  const h = height;
  const hasRadius = radius && radius.some((r) => r !== 0);

  if (!hasRadius) {
    // Canvas support negative width/height of rect
    context.rect(0, 0, w, h);
  } else {
    const signX = width > 0 ? 1 : -1;
    const signY = height > 0 ? 1 : -1;
    const sweepFlag = signX + signY === 0;
    const [tlr, trr, brr, blr] = radius.map((r) =>
      clamp(r, 0, Math.min(Math.abs(w) / 2, Math.abs(h) / 2)),
    );

    context.moveTo(signX * tlr, 0);
    context.lineTo(w - signX * trr, 0);
    if (trr !== 0) {
      context.arc(
        w - signX * trr,
        signY * trr,
        trr,
        (-signY * Math.PI) / 2,
        signX > 0 ? 0 : Math.PI,
        sweepFlag,
      );
    }
    context.lineTo(w, h - signY * brr);
    if (brr !== 0) {
      context.arc(
        w - signX * brr,
        h - signY * brr,
        brr,
        signX > 0 ? 0 : Math.PI,
        signY > 0 ? Math.PI / 2 : 1.5 * Math.PI,
        sweepFlag,
      );
    }
    context.lineTo(signX * blr, h);
    if (blr !== 0) {
      context.arc(
        signX * blr,
        h - signY * blr,
        blr,
        signY > 0 ? Math.PI / 2 : -Math.PI / 2,
        signX > 0 ? Math.PI : 0,
        sweepFlag,
      );
    }
    context.lineTo(0, signY * tlr);
    if (tlr !== 0) {
      context.arc(
        signX * tlr,
        signY * tlr,
        tlr,
        signX > 0 ? Math.PI : 0,
        signY > 0 ? Math.PI * 1.5 : Math.PI / 2,
        sweepFlag,
      );
    }
  }
}
