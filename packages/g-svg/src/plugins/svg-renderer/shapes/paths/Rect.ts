import type { ParsedRectStyleProps } from '@antv/g-lite';
import { clamp } from '@antv/util';

export function updateRectElementAttribute(
  $el: SVGElement,
  parsedStyle: ParsedRectStyleProps,
) {
  const { radius, x = 0, y = 0, width, height } = parsedStyle;

  // CSSKeyword: auto
  if (!isFinite(width) || !isFinite(height)) {
    return;
  }

  const hasRadius = radius && radius.some((r) => r !== 0);

  let d = '';
  if (!hasRadius) {
    d = `M ${x},${y} l ${width},0 l 0,${height} l${-width} 0 z`;
  } else {
    const [tlr, trr, brr, blr] = radius.map((r) =>
      clamp(r, 0, Math.min(Math.abs(width) / 2, Math.abs(height) / 2)),
    );

    const signX = width > 0 ? 1 : -1;
    const signY = height > 0 ? 1 : -1;
    // sweep-flag @see https://developer.mozilla.org/zh-CN/docs/Web/SVG/Tutorial/Paths#arcs
    const sweepFlag = signX + signY !== 0 ? 1 : 0;
    d = [
      [`M ${signX * tlr + x},${y}`],
      [`l ${width - signX * (tlr + trr)},0`],
      [`a ${trr},${trr},0,0,${sweepFlag},${signX * trr},${signY * trr}`],
      [`l 0,${height - signY * (trr + brr)}`],
      [`a ${brr},${brr},0,0,${sweepFlag},${-signX * brr},${signY * brr}`],
      [`l ${signX * (brr + blr) - width},0`],
      [`a ${blr},${blr},0,0,${sweepFlag},${-signX * blr},${-signY * blr}`],
      [`l 0,${signY * (blr + tlr) - height}`],
      [`a ${tlr},${tlr},0,0,${sweepFlag},${signX * tlr},${-signY * tlr}`],
      ['z'],
    ].join(' ');
  }
  $el.setAttribute('d', d);
}
