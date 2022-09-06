import type { ParsedLineStyleProps } from '@antv/g-lite';
import { DisplayObject } from '@antv/g-lite';

export function updateLineElementAttribute($el: SVGElement, parsedStyle: ParsedLineStyleProps) {
  const {
    x1,
    y1,
    x2,
    y2,
    defX = 0,
    defY = 0,
    markerStart,
    markerEnd,
    markerStartOffset,
    markerEndOffset,
  } = parsedStyle;

  let startOffsetX = 0;
  let startOffsetY = 0;
  let endOffsetX = 0;
  let endOffsetY = 0;

  let rad = 0;
  let x: number;
  let y: number;

  if (markerStart && markerStart instanceof DisplayObject && markerStartOffset) {
    x = x2 - x1;
    y = y2 - y1;
    rad = Math.atan2(y, x);
    startOffsetX = Math.cos(rad) * (markerStartOffset || 0);
    startOffsetY = Math.sin(rad) * (markerStartOffset || 0);
  }

  if (markerEnd && markerEnd instanceof DisplayObject && markerEndOffset) {
    x = x1 - x2;
    y = y1 - y2;
    rad = Math.atan2(y, x);
    endOffsetX = Math.cos(rad) * (markerEndOffset || 0);
    endOffsetY = Math.sin(rad) * (markerEndOffset || 0);
  }

  // @see https://github.com/antvis/g/issues/1038
  $el.setAttribute('x1', `${x1 - defX + startOffsetX}`);
  $el.setAttribute('y1', `${y1 - defY + startOffsetY}`);
  $el.setAttribute('x2', `${x2 - defX + endOffsetX}`);
  $el.setAttribute('y2', `${y2 - defY + endOffsetY}`);
}
