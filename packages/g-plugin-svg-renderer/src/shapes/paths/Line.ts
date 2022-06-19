import type { ParsedLineStyleProps } from '@antv/g';

export function updateLineElementAttribute($el: SVGElement, parsedStyle: ParsedLineStyleProps) {
  const { x1, y1, x2, y2 } = parsedStyle;

  $el.setAttribute('x1', `${x1.value}`);
  $el.setAttribute('y1', `${y1.value}`);
  $el.setAttribute('x2', `${x2.value}`);
  $el.setAttribute('y2', `${y2.value}`);
}
