import type { ParsedPolylineStyleProps } from '@antv/g-lite';
import { DisplayObject } from '@antv/g-lite';

export function updatePolylineElementAttribute(
  $el: SVGElement,
  parsedStyle: ParsedPolylineStyleProps,
) {
  const {
    points: { points },
    defX = 0,
    defY = 0,
    markerStart,
    markerStartOffset,
    markerEnd,
    markerEndOffset,
  } = parsedStyle;
  const length = points.length;

  if (points && length >= 2) {
    let startOffsetX = 0;
    let startOffsetY = 0;
    let endOffsetX = 0;
    let endOffsetY = 0;

    let rad = 0;
    let x: number;
    let y: number;

    if (markerStart && markerStart instanceof DisplayObject && markerStartOffset) {
      x = points[1][0] - points[0][0];
      y = points[1][1] - points[0][1];
      rad = Math.atan2(y, x);
      startOffsetX = Math.cos(rad) * (markerStartOffset || 0);
      startOffsetY = Math.sin(rad) * (markerStartOffset || 0);
    }

    if (markerEnd && markerEnd instanceof DisplayObject && markerEndOffset) {
      x = points[length - 2][0] - points[length - 1][0];
      y = points[length - 2][1] - points[length - 1][1];
      rad = Math.atan2(y, x);
      endOffsetX = Math.cos(rad) * (markerEndOffset || 0);
      endOffsetY = Math.sin(rad) * (markerEndOffset || 0);
    }

    $el.setAttribute(
      'points',
      points
        .map((point: [number, number], i) => {
          let offsetX = 0;
          let offsetY = 0;
          if (i === 0) {
            offsetX = startOffsetX;
            offsetY = startOffsetY;
          } else if (i === length - 1) {
            offsetX = endOffsetX;
            offsetY = endOffsetY;
          }
          return `${point[0] - defX + offsetX},${point[1] - defY + offsetY}`;
        })
        .join(' '),
    );
  }
}
