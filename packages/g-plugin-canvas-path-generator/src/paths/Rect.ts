import type { ParsedRectStyleProps } from '@antv/g-lite';
import { clamp } from '@antv/util';
import { PI, HALF_PI, ONE_AND_HALF_PI } from '../constants';

export function generatePath(
  context: CanvasRenderingContext2D,
  parsedStyle: ParsedRectStyleProps,
) {
  const { x = 0, y = 0, radius, width: w, height: h } = parsedStyle;

  const hasRadius = radius && radius.some((r) => r !== 0);

  if (!hasRadius) {
    // Canvas support negative width/height of rect
    context.rect(x, y, w, h);
  } else {
    const signX = w > 0 ? 1 : -1;
    const signY = h > 0 ? 1 : -1;
    const sweepFlag = signX + signY === 0;
    const [tlr, trr, brr, blr] = radius.map((r) =>
      clamp(r, 0, Math.min(Math.abs(w) / 2, Math.abs(h) / 2)),
    );

    const signXTlrAddX = signX * tlr + x;
    const wMinusSignXTrrAddX = w - signX * trr + x;
    context.moveTo(signXTlrAddX, y);
    context.lineTo(wMinusSignXTrrAddX, y);
    if (trr !== 0) {
      context.arc(
        wMinusSignXTrrAddX,
        signY * trr + y,
        trr,
        -signY * HALF_PI,
        signX > 0 ? 0 : PI,
        sweepFlag,
      );
    }
    const hMinusSignYBrrAddY = h - signY * brr + y;
    context.lineTo(w + x, hMinusSignYBrrAddY);
    if (brr !== 0) {
      context.arc(
        w - signX * brr + x,
        hMinusSignYBrrAddY,
        brr,
        signX > 0 ? 0 : PI,
        signY > 0 ? HALF_PI : ONE_AND_HALF_PI,
        sweepFlag,
      );
    }
    const signXMulBlrAddX = signX * blr + x;
    context.lineTo(signXMulBlrAddX, h + y);
    if (blr !== 0) {
      context.arc(
        signXMulBlrAddX,
        h - signY * blr + y,
        blr,
        signY > 0 ? HALF_PI : -HALF_PI,
        signX > 0 ? PI : 0,
        sweepFlag,
      );
    }
    const signYMulTlrAddY = signY * tlr + y;
    context.lineTo(x, signYMulTlrAddY);
    if (tlr !== 0) {
      context.arc(
        signXTlrAddX,
        signYMulTlrAddY,
        tlr,
        signX > 0 ? PI : 0,
        signY > 0 ? ONE_AND_HALF_PI : HALF_PI,
        sweepFlag,
      );
    }
  }
}
