import type { ParsedLineStyleProps } from '@antv/g';

export function updateLineElementAttribute($el: SVGElement, parsedStyle: ParsedLineStyleProps) {
  const { x1, y1, x2, y2, defX = 0, defY = 0 } = parsedStyle;

  // @see https://github.com/antvis/g/issues/1038
  $el.setAttribute('x1', `${x1.value - defX}`);
  $el.setAttribute('y1', `${y1.value - defY}`);
  $el.setAttribute('x2', `${x2.value - defX}`);
  $el.setAttribute('y2', `${y2.value - defY}`);
}
