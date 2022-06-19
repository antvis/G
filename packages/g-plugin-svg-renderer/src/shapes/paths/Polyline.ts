import type { ParsedPolylineStyleProps } from '@antv/g';

export function updatePolylineElementAttribute(
  $el: SVGElement,
  parsedStyle: ParsedPolylineStyleProps,
) {
  const { points } = parsedStyle;

  if (points && points.points && points.points.length >= 2) {
    $el.setAttribute(
      'points',
      points.points.map((point: [number, number]) => `${point[0]},${point[1]}`).join(' '),
    );
  }
}
