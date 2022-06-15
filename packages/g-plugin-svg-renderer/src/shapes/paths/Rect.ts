import type { ParsedRectStyleProps } from '@antv/g';
import { clamp } from '@antv/g';

export function updateRectElementAttribute($el: SVGElement, parsedStyle: ParsedRectStyleProps) {
  const { radius, width, height } = parsedStyle;

  // CSSKeyword: auto
  if (!isFinite(width.value) || !isFinite(height.value)) {
    return;
  }

  const hasRadius = radius && radius.some((r) => r.value !== 0);

  let d = '';
  if (!hasRadius) {
    d = `M 0,0 l ${width.value},0 l 0,${height.value} l${-width.value} 0 z`;
  } else {
    const [tlr, trr, brr, blr] = radius.map((r) =>
      clamp(r.value, 0, Math.min(Math.abs(width.value) / 2, Math.abs(height.value) / 2)),
    );

    const signX = width.value > 0 ? 1 : -1;
    const signY = height.value > 0 ? 1 : -1;
    // sweep-flag @see https://developer.mozilla.org/zh-CN/docs/Web/SVG/Tutorial/Paths#arcs
    const sweepFlag = signX + signY !== 0 ? 1 : 0;
    d = [
      [`M ${signX * tlr},0`],
      [`l ${width.value - signX * (tlr + trr)},0`],
      [`a ${trr},${trr},0,0,${sweepFlag},${signX * trr},${signY * trr}`],
      [`l 0,${height.value - signY * (trr + brr)}`],
      [`a ${brr},${brr},0,0,${sweepFlag},${-signX * brr},${signY * brr}`],
      [`l ${signX * (brr + blr) - width.value},0`],
      [`a ${blr},${blr},0,0,${sweepFlag},${-signX * blr},${-signY * blr}`],
      [`l 0,${signY * (blr + tlr) - height.value}`],
      [`a ${tlr},${tlr},0,0,${sweepFlag},${signX * tlr},${-signY * tlr}`],
      ['z'],
    ].join(' ');
  }
  $el.setAttribute('d', d);
}
